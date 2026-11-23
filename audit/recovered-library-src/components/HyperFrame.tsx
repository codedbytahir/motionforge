import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/context';

export interface HyperFrameProps {
  html: string;
  css?: string;
  js?: string;
  frameVariableName?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HyperFrame Component
 *
 * Enables creating video frames using pure HTML/CSS/JS.
 * Optimized using a persistent iframe and postMessage to avoid flicker.
 */
export const HyperFrame: React.FC<HyperFrameProps> = ({
  html,
  css,
  js,
  frameVariableName = 'frame',
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isLoadedRef = useRef(false);

  // Initial load: Set up the document structure
  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
              background: transparent;
            }
            ${css || ''}
          </style>
        </head>
        <body>
          <div id="content">${html}</div>
          <script>
            window.onFrameUpdate = function(newFrame, config) {
              const ${frameVariableName} = newFrame;
              const fps = config.fps;
              const width = config.width;
              const height = config.height;

              try {
                ${js || ''}
                if (typeof renderFrame === 'function') {
                  renderFrame(newFrame, config);
                }
              } catch (e) {
                console.error('Error in HyperFrame JS:', e);
              }
            };

            // Signal that we are ready
            window.parent.postMessage('hyperframe-ready', '*');
          </script>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = doc;
    isLoadedRef.current = false;
  }, [html, css, js, width, height, frameVariableName]);

  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'hyperframe-ready') {
        isLoadedRef.current = true;
        // Trigger immediate update for current frame
        updateIframeFrame(frame);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [frame]);

  // Update frame without reloading the iframe
  const updateIframeFrame = (currentFrame: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow && isLoadedRef.current) {
      try {
        // We call the function directly on the contentWindow for maximum performance
        // @ts-ignore
        if (typeof iframeRef.current.contentWindow.onFrameUpdate === 'function') {
          // @ts-ignore
          iframeRef.current.contentWindow.onFrameUpdate(currentFrame, { fps, width, height });
        }
      } catch (e) {
        // Fallback to postMessage if direct access is blocked (though same-origin srcdoc should be fine)
        iframeRef.current.contentWindow.postMessage({
          type: 'update-frame',
          frame: currentFrame,
          config: { fps, width, height }
        }, '*');
      }
    }
  };

  // Sync frame on every React render
  useEffect(() => {
    updateIframeFrame(frame);
  }, [frame, fps, width, height]);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
    >
      <iframe
        ref={iframeRef}
        title="hyperframe-render"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

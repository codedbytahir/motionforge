'use client';

import React, { useCallback, useRef } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onCompileError?: (error: string) => void;
}

/**
 * Monaco-based code editor with MotionForge TypeScript definitions.
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onCompileError,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Define MotionForge theme
      monaco.editor.defineTheme('motionforge', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '4a6a4a', fontStyle: 'italic' },
          { token: 'keyword', foreground: '10b981' },
          { token: 'string', foreground: 'f59e0b' },
          { token: 'number', foreground: '3b82f6' },
          { token: 'type', foreground: 'ec4899' },
          { token: 'function', foreground: '10b981' },
          { token: 'variable', foreground: 'e2e8f0' },
          { token: 'operator', foreground: '8b5cf6' },
        ],
        colors: {
          'editor.background': '#0a0a0a',
          'editor.foreground': '#e2e8f0',
          'editor.lineHighlightBackground': '#ffffff05',
          'editor.selectionBackground': '#10b98130',
          'editor.inactiveSelectionBackground': '#10b98115',
          'editorCursor.foreground': '#10b981',
          'editorLineNumber.foreground': '#2d4a3a',
          'editorLineNumber.activeForeground': '#10b981',
          'editorIndentGuide.background': '#1a2a20',
          'editorIndentGuide.activeBackground': '#2d4a3a',
          'editorGutter.background': '#0a0a0a',
          'editorWidget.background': '#0d0d0d',
          'editorWidget.border': '#1a2a20',
          'editorSuggestWidget.background': '#0d0d0d',
          'editorSuggestWidget.border': '#1a2a20',
          'editorSuggestWidget.selectedBackground': '#10b98120',
          'list.hoverBackground': '#ffffff08',
          'scrollbar.shadow': '#00000000',
          'scrollbarSlider.background': '#10b98120',
          'scrollbarSlider.hoverBackground': '#10b98140',
        },
      });

      monaco.editor.setTheme('motionforge');

      // Add MotionForge type definitions
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `
        declare module 'motionforge' {
          export function useCurrentFrame(): number;
          export function useVideoConfig(): {
            fps: number;
            durationInFrames: number;
            width: number;
            height: number;
          };
          export const AbsoluteFill: React.FC<{
            style?: React.CSSProperties;
            children?: React.ReactNode;
          }>;
          export const Sequence: React.FC<{
            from?: number;
            durationInFrames?: number;
            children: React.ReactNode;
          }>;
          export function interpolate(
            input: number,
            inputRange: number[],
            outputRange: number[],
            options?: {
              extrapolateLeft?: 'clamp' | 'extend';
              extrapolateRight?: 'clamp' | 'extend';
              easing?: (t: number) => number;
            }
          ): number;
          export function spring(config: {
            frame: number;
            fps: number;
            config?: { damping?: number; mass?: number; stiffness?: number };
            from?: number;
            to?: number;
          }): number;
          export const Easing: {
            linear: (t: number) => number;
            easeInQuad: (t: number) => number;
            easeOutQuad: (t: number) => number;
            easeInOutQuad: (t: number) => number;
            easeInCubic: (t: number) => number;
            easeOutCubic: (t: number) => number;
            easeInOutCubic: (t: number) => number;
            easeOutExpo: (t: number) => number;
            easeInOutQuart: (t: number) => number;
            easeOutBack: (t: number) => number;
            easeOutElastic: (t: number) => number;
            easeOutBounce: (t: number) => number;
          };
          export const easing: typeof Easing;
        }
        `,
        'ts:motionforge.d.ts'
      );

      // Configure TypeScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: false,
        noEmit: true,
        allowJs: true,
      });

      // Focus the editor
      editor.focus();
    },
    []
  );

  const handleChange: OnChange = useCallback(
    (value) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language="typescript"
        theme="motionforge"
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 20,
          padding: { top: 16 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'none',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
            <div className="flex items-center gap-3 text-emerald-500">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;

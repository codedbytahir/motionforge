'use client';
import React,{useEffect,useRef} from 'react';
import {useCurrentFrame,useVideoConfig} from '../core/context';
export interface HyperFrameProps {html:string;css?:string;js?:string;frameVariableName?:string;className?:string;style?:React.CSSProperties;}
/** Sandboxed executable content. Not a substitute for process isolation. */
export const HyperFrame:React.FC<HyperFrameProps>=({html,css='',js='',frameVariableName='frame',className,style})=>{
 const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig(),iframe=useRef<HTMLIFrameElement>(null),ready=useRef(false);
 const current=useRef({frame,config:{width,height,fps}});current.current={frame,config:{width,height,fps}};
 if(!/^[a-zA-Z_$][\w$]*$/.test(frameVariableName))throw new Error('Invalid frameVariableName');
 useEffect(()=>{
  const message=(event:MessageEvent)=>{if(event.source===iframe.current?.contentWindow&&event.data==='hyperframe-ready'){ready.current=true;iframe.current?.contentWindow?.postMessage({type:'motionforge-frame',...current.current},'*');}};
  window.addEventListener('message',message);ready.current=false;
  if(iframe.current)iframe.current.srcdoc=`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:transparent}${css}</style></head><body>${html}<script>window.addEventListener('message',function(event){if(event.source!==parent||!event.data||event.data.type!=='motionforge-frame')return;const newFrame=event.data.frame,config=event.data.config;const ${frameVariableName}=newFrame;const fps=config.fps,width=config.width,height=config.height;try{${js}\n;if(typeof renderFrame==='function')renderFrame(newFrame,config);}catch(e){console.error('HyperFrame execution failed',e);}});parent.postMessage('hyperframe-ready','*');<\/script></body></html>`;
  return ()=>{ready.current=false;window.removeEventListener('message',message);};
 },[html,css,js,width,height,frameVariableName]);
 useEffect(()=>{if(ready.current)iframe.current?.contentWindow?.postMessage({type:'motionforge-frame',...current.current},'*');},[frame,width,height,fps]);
 return <div className={className} style={{width:'100%',height:'100%',position:'relative',...style}}><iframe ref={iframe} sandbox="allow-scripts" referrerPolicy="no-referrer" title="HyperFrame sandbox" style={{width:'100%',height:'100%',border:'none',pointerEvents:'none'}}/></div>;
};

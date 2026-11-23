'use client';
import React, {useEffect, useRef, useState} from 'react';
import type {AnimationItem} from 'lottie-web';
import {useCurrentFrame, useVideoConfig} from '../core/context';
import {useRelativeCurrentFrame} from './Sequence';
import {mapSourceFrame} from '../utils/frame-time';

export interface LottieProps {
 src: string | object;
 frameStart?: number;
 frameEnd?: number;
 playbackRate?: number;
 loop?: boolean;
 width?: number | string;
 height?: number | string;
 style?: React.CSSProperties;
 className?: string;
 loadingTimeoutMs?: number;
 onReady?: () => void;
 onError?: (error: Error) => void;
}
/** Frame-driven SVG playback. Source FPS is converted to composition FPS. */
export const Lottie: React.FC<LottieProps> = ({src,frameStart=0,frameEnd,playbackRate=1,loop=false,width,height,style,className,loadingTimeoutMs=10000,onReady,onError}) => {
 const container=useRef<HTMLDivElement>(null),animation=useRef<AnimationItem|null>(null);
 const [loadRevision,setLoadRevision]=useState(0);
 const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null);
 const callbacks=useRef({onReady,onError});callbacks.current={onReady,onError};
 const absolute=useCurrentFrame(),relative=useRelativeCurrentFrame(),{fps}=useVideoConfig();
 const frame=relative??absolute;
 useEffect(()=>{
  let cancelled=false,settled=false,anim:AnimationItem|null=null;
  setReady(false);setError(null);
  const fail=(cause:unknown)=>{if(cancelled||settled)return;settled=true;clearTimeout(timer);const e=cause instanceof Error?cause:new Error('Lottie failed to load');setError(e.message);anim?.destroy();if(animation.current===anim)animation.current=null;callbacks.current.onError?.(e);};
  const timer=setTimeout(()=>fail(new Error('Lottie loading timed out')),loadingTimeoutMs);
  if(!Number.isFinite(loadingTimeoutMs)||loadingTimeoutMs<100||loadingTimeoutMs>60000){fail(new Error('loadingTimeoutMs must be 100..60000'));return ()=>{cancelled=true;clearTimeout(timer);};}
  void import('lottie-web').then(module=>{
   if(cancelled||settled||!container.current)return;
   anim=module.default.loadAnimation({container:container.current,renderer:'svg',autoplay:false,loop:false,...(typeof src==='string'?{path:src}:{animationData:JSON.parse(JSON.stringify(src))}),rendererSettings:{progressiveLoad:false,hideOnTransparent:true}});
   animation.current=anim;
   const loaded=()=>{if(cancelled||settled)return;settled=true;clearTimeout(timer);setReady(true);setLoadRevision(v=>v+1);};
   anim.addEventListener('DOMLoaded',loaded);
   anim.addEventListener('data_failed',()=>fail(new Error('Lottie data failed to load')));
   if(anim.isLoaded)queueMicrotask(loaded);
  }).catch(fail);
  return ()=>{cancelled=true;clearTimeout(timer);anim?.destroy();if(animation.current===anim)animation.current=null;};
 },[src,loadingTimeoutMs]);
 useEffect(()=>{
  const anim=animation.current;if(!ready||!anim)return;
  try{const target=mapSourceFrame({frame,compositionFps:fps,sourceFps:anim.frameRate,frameStart,frameEnd:frameEnd??anim.totalFrames,rate:playbackRate,loop});anim.goToAndStop(target,true);}catch(cause){const e=cause instanceof Error?cause:new Error(String(cause));setError(e.message);callbacks.current.onError?.(e);}
 },[frame,fps,ready,loadRevision,src,frameStart,frameEnd,playbackRate,loop]);
 // Announce readiness after the frame synchronization effect has run.
 useEffect(()=>{if(ready&&!error)callbacks.current.onReady?.();},[ready,error,loadRevision]);
 return <div style={{width:width??'100%',height:height??'100%',...style}} className={className} data-lottie-loaded={ready&&!error} data-motionforge-error={error??undefined}><div ref={container} style={{width:'100%',height:'100%'}}/>{error?<div role="alert">Lottie: {error}</div>:null}</div>;
};

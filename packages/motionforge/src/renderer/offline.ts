import {Output,BufferTarget,WebMOutputFormat,Mp4OutputFormat,CanvasSource,AudioBufferSource,canEncodeAudio,canEncodeVideo} from 'mediabunny';
import type {VideoConfig} from '../core/types';

export interface OfflineAudioClip {buffer:AudioBuffer;at?:number;offset?:number;duration?:number;gain?:number;}
/** Deterministically mix decoded PCM clips. Never records live speakers/microphones. */
export async function mixOfflineAudio(clips:OfflineAudioClip[],duration:number,sampleRate=48000,channels=2):Promise<AudioBuffer>{
 if(!Number.isFinite(duration)||duration<=0||duration>600||!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>96000||!Number.isInteger(channels)||channels<1||channels>2)throw new RangeError('Invalid offline audio configuration');
 const context=new OfflineAudioContext(channels,Math.round(duration*sampleRate),sampleRate);
 for(const clip of clips){const at=clip.at??0,offset=clip.offset??0,gain=clip.gain??1,length=clip.duration??clip.buffer.duration-offset;
  if(![at,offset,gain,length].every(Number.isFinite)||at<0||offset<0||length<=0||offset+length>clip.buffer.duration+1/sampleRate||gain<0||gain>4)throw new RangeError('Invalid audio clip');
  if(at>=duration)continue;
  const source=context.createBufferSource(),level=context.createGain();source.buffer=clip.buffer;level.gain.value=gain;source.connect(level).connect(context.destination);source.start(at,offset,Math.min(length,duration-at));
 }
 return context.startRendering();
}
export interface OfflineExportOptions {
 canvas:HTMLCanvasElement|OffscreenCanvas;
 config:VideoConfig;
 /** Must seek/draw the requested frame and await fonts/images/Lottie/WebGL readiness. */
 renderFrame:(frame:number,timeSeconds:number)=>void|Promise<void>;
 audio?:AudioBuffer;
 format?:'webm'|'mp4';
 signal?:AbortSignal;
 frameTimeoutMs?:number;
 onProgress?:(completed:number,total:number)=>void;
}
export interface OfflineExportResult {blob:Blob;frameCount:number;duration:number;format:'webm'|'mp4';hasAudio:boolean;}
/** Explicit timestamps, real muxing, awaited backpressure. Caller owns per-frame readiness. */
export async function exportOfflineVideo(options:OfflineExportOptions):Promise<OfflineExportResult>{
 const {canvas,config,renderFrame,audio,signal,onProgress}=options;
 const format=options.format??'webm',timeout=options.frameTimeoutMs??15000;
 if(!['webm','mp4'].includes(format)||typeof renderFrame!=='function')throw new TypeError('Invalid export options');
 if(!Number.isInteger(config.width)||!Number.isInteger(config.height)||config.width<2||config.height<2||config.width>4096||config.height>4096||!Number.isFinite(config.fps)||config.fps<=0||config.fps>120||!Number.isInteger(config.durationInFrames)||config.durationInFrames<1||config.durationInFrames/config.fps>600||!Number.isFinite(timeout)||timeout<1||timeout>120000)throw new RangeError('Invalid offline video configuration');
 if(canvas.width!==config.width||canvas.height!==config.height)throw new RangeError('Canvas dimensions must match config');
 const duration=config.durationInFrames/config.fps;
 if(audio&&(Math.abs(audio.duration-duration)>1/audio.sampleRate||audio.numberOfChannels>2))throw new RangeError('Audio must cover the exact video duration, within one PCM sample; mix or trim first');
 const aborted=()=>{if(signal?.aborted)throw new DOMException('Export aborted','AbortError');};aborted();
 const videoCodec=format==='mp4'?'avc':'vp9',audioCodec=format==='mp4'?'aac':'opus';
 if(!await canEncodeVideo(videoCodec,{width:config.width,height:config.height,bitrate:5000000}))throw new Error('Video codec is not supported: '+videoCodec);
 if(audio&&!await canEncodeAudio(audioCodec,{sampleRate:audio.sampleRate,numberOfChannels:audio.numberOfChannels,bitrate:128000}))throw new Error('Audio codec is not supported: '+audioCodec);
 aborted();
 const target=new BufferTarget(),output=new Output({target,format:format==='mp4'?new Mp4OutputFormat({fastStart:'in-memory'}):new WebMOutputFormat()});
 const video=new CanvasSource(canvas,{codec:videoCodec,bitrate:5000000,keyFrameInterval:1});
 output.addVideoTrack(video,{frameRate:config.fps});
 const sound=audio?new AudioBufferSource({codec:audioCodec,bitrate:128000}):null;if(sound)output.addAudioTrack(sound);
 async function guarded<T>(task:()=>T|Promise<T>):Promise<T>{
  aborted();let timer:ReturnType<typeof setTimeout>|undefined;let onAbort:(()=>void)|undefined;
  try{return await Promise.race([Promise.resolve().then(task),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Offline export operation timed out')),timeout);onAbort=()=>reject(new DOMException('Export aborted','AbortError'));signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted)onAbort();})]);}
  finally{if(timer)clearTimeout(timer);if(onAbort)signal?.removeEventListener('abort',onAbort);}
 }
 try{
  await guarded(()=>output.start());
  if(sound&&audio){await guarded(()=>sound.add(audio));sound.close();}
  for(let frame=0;frame<config.durationInFrames;frame++){
   await guarded(()=>renderFrame(frame,frame/config.fps));aborted();
   if(canvas.width!==config.width||canvas.height!==config.height)throw new Error('Canvas resized during export');
   await guarded(()=>video.add(frame/config.fps,1/config.fps));onProgress?.(frame+1,config.durationInFrames);
  }
  video.close();await guarded(()=>output.finalize());aborted();
  if(!target.buffer?.byteLength)throw new Error('Muxer produced an empty output');
  return {blob:new Blob([target.buffer],{type:format==='mp4'?'video/mp4':'video/webm'}),frameCount:config.durationInFrames,duration,format,hasAudio:!!audio};
 }catch(error){await output.cancel().catch(()=>{});throw error;}
}

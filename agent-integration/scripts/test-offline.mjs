import {build} from '../../packages/motionforge/node_modules/esbuild/lib/main.js';
import {chromium} from '../../node_modules/@playwright/test/index.mjs';
import {createServer} from 'node:http';import {writeFileSync,mkdirSync} from 'node:fs';import assert from 'node:assert/strict';
const bundle=await build({entryPoints:[new URL('../../packages/motionforge/dist/renderer/index.js',import.meta.url).pathname],bundle:true,write:false,format:'iife',globalName:'MF',platform:'browser'});
const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].contents);}else{res.setHeader('Content-Type','text/html');res.end('<canvas id="c" width="320" height="180"></canvas><script src="/app.js"></script>');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']});mkdirSync(new URL('../../audit/offline/',import.meta.url),{recursive:true});
try{
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port);
 const result=await p.evaluate(async()=>{
  const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),config={width:320,height:180,fps:30,durationInFrames:60};
  const pulse=new AudioBuffer({length:4800,sampleRate:48000,numberOfChannels:1});const pcm=pulse.getChannelData(0);for(let i=0;i<pcm.length;i++)pcm[i]=.4*Math.sin(2*Math.PI*1000*i/48000);
  const audio=await MF.mixOfflineAudio([{buffer:pulse,at:1}],2);const frames=[];
  const rendered=await MF.exportOfflineVideo({canvas,config,audio,renderFrame:async(frame,time)=>{frames.push(frame);await new Promise(r=>setTimeout(r,frame%3));ctx.fillStyle=frame<30?'#000000':'#ffffff';ctx.fillRect(0,0,320,180);ctx.fillStyle='#10b981';ctx.fillRect(frame*4,60,20,20);}});
  const bytes=new Uint8Array(await rendered.blob.arrayBuffer());
  const decoded=await new AudioContext().decodeAudioData(bytes.slice().buffer);const channel=decoded.getChannelData(0);let first=-1;for(let i=0;i<channel.length;i++)if(Math.abs(channel[i])>.03){first=i/decoded.sampleRate;break;}
  const url=URL.createObjectURL(rendered.blob),video=document.createElement('video');video.muted=true;video.src=url;document.body.append(video);await new Promise((r,j)=>{video.onloadedmetadata=r;video.onerror=()=>j(new Error('native video metadata failed'));});
  const seekPixel=async time=>{video.currentTime=time;await new Promise(r=>video.onseeked=r);const c=document.createElement('canvas');c.width=320;c.height=180;const d=c.getContext('2d');d.drawImage(video,0,0);return [...d.getImageData(300,10,1,1).data];};
  const dark=await seekPixel(.5),light=await seekPixel(1.25);video.currentTime=0;await video.play();await new Promise((r,j)=>{video.onended=r;video.onerror=j;setTimeout(()=>j(new Error('native playback did not finish')),6000);});URL.revokeObjectURL(url);
  const negative=[];
  for(const [name,extra] of [['capture-error',{renderFrame:()=>{throw new Error('asset missing')}}],['readiness-timeout',{renderFrame:()=>new Promise(()=>{}),frameTimeoutMs:30}],['abort',{signal:AbortSignal.abort()}],['audio-duration',{audio:pulse}],['invalid-config',{config:{...config,fps:0}}]]){try{await MF.exportOfflineVideo({canvas,config,renderFrame:()=>{},...extra});negative.push({name,rejected:false});}catch(e){negative.push({name,rejected:true,message:String(e)});}}
  return {bytes:Array.from(bytes),frameCount:rendered.frameCount,frames,firstAudioSeconds:first,nativeDuration:video.duration,dark,light,negative};
 });
 assert.deepEqual(result.frames,Array.from({length:60},(_,i)=>i));assert.equal(result.frameCount,60);assert.ok(Math.abs(result.firstAudioSeconds-1)<.04);assert.ok(Math.abs(result.nativeDuration-2)<.05);assert.ok(result.dark[0]<10&&result.light[0]>240);assert.ok(result.negative.every(x=>x.rejected));assert.deepEqual(errors,[]);
 writeFileSync(new URL('../../audit/offline/proof.webm',import.meta.url),Buffer.from(result.bytes));delete result.bytes;writeFileSync(new URL('../../audit/offline/results.json',import.meta.url),JSON.stringify({passed:true,...result},null,2));console.log('PASS real WebM VP9+Opus offline export, 60 sequential frames, native seek/playback/decode, audio pulse sync and 5 failure cases');
}finally{await browser.close();await new Promise(r=>server.close(r));}

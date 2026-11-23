// Proposed bridge utility, not wired into MotionForge playback yet.
export function sourceFrameAt({hostFrame,hostFps,sourceFps,sourceFrames,startFrame=0,sourceStart=0,rate=1,loop=false}){
 for(const [k,v] of Object.entries({hostFrame,hostFps,sourceFps,sourceFrames,startFrame,sourceStart,rate}))if(!Number.isFinite(v))throw new TypeError(k+' must be finite');
 if(hostFps<=0||sourceFps<=0||!Number.isInteger(sourceFrames)||sourceFrames<=0||rate<=0||sourceStart<0||sourceStart>=sourceFrames)throw new RangeError('Invalid time mapping configuration; reverse playback is not supported');
 if(typeof loop!=='boolean')throw new TypeError('loop must be boolean');
 const local=hostFrame-startFrame;if(local<0)return {visible:false,frame:sourceStart};
 const offset=local*sourceFps/hostFps*rate,span=sourceFrames-sourceStart;
 return {visible:true,frame:sourceStart+(loop?offset%span:Math.min(offset,Math.max(0,span-.001)))};
}

/** Map sequence-local composition frames into an exclusive Lottie trim interval. */
export function mapSourceFrame({frame,compositionFps,sourceFps,frameStart=0,frameEnd,rate=1,loop=false}:{frame:number;compositionFps:number;sourceFps:number;frameStart?:number;frameEnd:number;rate?:number;loop?:boolean}):number {
 for(const [key,value] of Object.entries({frame,compositionFps,sourceFps,frameStart,frameEnd,rate}))if(!Number.isFinite(value))throw new TypeError(`${key} must be finite`);
 if(compositionFps<=0||sourceFps<=0||frameStart<0||frameEnd<=frameStart||rate<=0)throw new RangeError('Invalid frame mapping configuration; reverse rates are not supported');
 if(typeof loop!=='boolean')throw new TypeError('loop must be boolean');
 const span=frameEnd-frameStart,offset=Math.max(0,frame)*sourceFps/compositionFps*rate;
 return frameStart+(loop?offset%span:Math.min(offset,Math.max(0,span-.001)));
}

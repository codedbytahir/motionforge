import assert from 'node:assert/strict';
import {sourceFrameAt as map} from './frame-time.mjs';
const base={hostFps:30,sourceFps:60,sourceFrames:120};let checks=0;
const equal=(a,b)=>{assert.deepEqual(a,b);checks++};
equal(map({...base,hostFrame:15}),{visible:true,frame:30});
equal(map({...base,hostFrame:15,startFrame:30}),{visible:false,frame:0});
equal(map({...base,hostFrame:30,startFrame:30}),{visible:true,frame:0});
equal(map({...base,hostFrame:45,startFrame:30}),{visible:true,frame:30});
equal(map({...base,hostFrame:90,loop:true}),{visible:true,frame:60});
equal(map({...base,hostFrame:60,loop:true}),{visible:true,frame:0});
equal(map({...base,hostFrame:60}),{visible:true,frame:119.999});
equal(map({...base,hostFrame:15,rate:.5}),{visible:true,frame:15});
equal(map({...base,hostFrame:15,sourceStart:20}),{visible:true,frame:50});
equal(map({...base,hostFrame:50,sourceStart:20,loop:true}),{visible:true,frame:20});
equal(map({...base,hostFrame:15,hostFps:60,sourceFps:30}),{visible:true,frame:7.5});
const a=map({...base,hostFrame:12});map({...base,hostFrame:45});equal(map({...base,hostFrame:12}),a);
assert.ok(Math.abs(map({...base,hostFps:30000/1001,hostFrame:30}).frame-60.06)<1e-9);checks++;
for(const patch of [{hostFps:0},{sourceFps:NaN},{sourceFrames:0},{sourceFrames:2.5},{rate:-1},{sourceStart:120},{hostFrame:Infinity},{loop:'yes'}]){assert.throws(()=>map({...base,hostFrame:0,...patch}));checks++}
console.log('PASS',checks,'frame mapping checks; no browser/export coverage implied');

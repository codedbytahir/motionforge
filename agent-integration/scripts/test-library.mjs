import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {mapSourceFrame} from '../../packages/motionforge/dist/trolic.js';
const root=new URL('../../packages/motionforge/',import.meta.url),pkg=JSON.parse(readFileSync(new URL('package.json',root)));
let count=0;for(const [entry,paths] of Object.entries(pkg.exports))for(const target of Object.values(typeof paths==='string'?{default:paths}:paths)){assert.ok(existsSync(new URL(target,root)),entry+' missing '+target);count++;}
const map=(p)=>mapSourceFrame({frame:15,compositionFps:30,sourceFps:60,frameEnd:120,...p});
assert.equal(map({}),30);assert.equal(map({compositionFps:60,sourceFps:30}),7.5);assert.equal(map({frame:60,loop:true}),0);assert.equal(map({frame:90,loop:true}),60);assert.equal(map({frame:90}),119.999);assert.equal(map({frame:-2}),0);assert.equal(map({frameStart:20}),50);assert.equal(map({rate:.5}),15);assert.throws(()=>map({rate:-1}));assert.throws(()=>map({compositionFps:0}));assert.throws(()=>map({frame:NaN}));assert.throws(()=>map({frameEnd:0}));
console.log('PASS',count,'export target checks + 12 library frame mapping checks');

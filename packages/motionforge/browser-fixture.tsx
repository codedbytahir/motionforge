import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {FrameProvider,useTimelineState} from './src/core/context';
import {Sequence} from './src/components/Sequence';
import {Trolic} from './src/components/Trolic';
import {compileForProfile} from '/home/user/trolic-publication/repo/api.js';
const source='canvas 400 400 dur=2 fps=60\ncircle orb p=[100,100] s=[40,40] f=#417c56 t=[["p",[[0,[100,100]],[2,[300,300]]],"linear"]]';
let compiles=0;const compiler=(s:string,o:{profile:string})=>{compiles++;return compileForProfile(s,o);};
function Demo(){const timeline=useTimelineState();const [variant,setVariant]=useState(false);Object.assign(window,{seek:timeline.setFrame,changeSource:()=>setVariant(v=>!v),compileCount:()=>compiles});return <Sequence from={30} durationInFrames={60}><Trolic source={variant?source.replace('#417c56','#dd5511'):source} compiler={compiler} onReady={()=>{(window as any).readyCount=((window as any).readyCount??0)+1;}}/></Sequence>}
createRoot(document.getElementById('root')!).render(<FrameProvider fps={30} durationInFrames={120} width={400} height={400}><Demo/></FrameProvider>);

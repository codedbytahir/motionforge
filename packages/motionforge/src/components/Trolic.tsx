'use client';
import React,{useMemo} from 'react';
import {Lottie,type LottieProps} from './Lottie';
/** Inject the installed Trolic compileForProfile function; no bundled compiler fork. */
export interface TrolicCompiler {
 (source:string,options:{profile:string}):{output:string;report?:unknown};
}
export interface TrolicProps extends Omit<LottieProps,'src'> {
 source:string;
 compiler:TrolicCompiler;
 profile?:string;
}
/** Compilation is memoized by source/compiler/profile, not by the current frame. */
export const Trolic:React.FC<TrolicProps>=({source,compiler,profile='lottie-web-svg',...props})=>{
 const data=useMemo(()=>{
  const result=compiler(source,{profile});const parsed=JSON.parse(result.output);
  if(!parsed||!Number.isFinite(parsed.fr)||parsed.fr<=0||!Array.isArray(parsed.layers))throw new Error('Trolic compiler must return Lottie JSON');
  return parsed as object;
 },[source,compiler,profile]);
 // Compilation failures intentionally reach the application error boundary.
 return <Lottie {...props} src={data}/>;
};

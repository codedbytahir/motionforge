// Verify npm's artifact, never the source checkout's dist alone.
import {mkdtempSync,readFileSync,existsSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,dirname,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(join(tmpdir(),'motionforge-pack-'));
const run=(cmd,args,cwd=temp)=>execFileSync(cmd,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:120000});
try{
 const packed=JSON.parse(run('npm',['pack','--ignore-scripts','--json','--pack-destination',temp],root))[0];
 const files=new Set(packed.files.map(f=>f.path));
 const manifest=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));let targets=0;
 function visit(value){if(typeof value==='string'){assert.ok(files.has(value.replace(/^\.\//,'')),'Missing tarball export '+value);targets++;}else for(const child of Object.values(value))visit(child);}
 visit(manifest.exports);
 writeFileSync(join(temp,'package.json'),JSON.stringify({private:true,type:'module'}));
 run('npm',['install','--ignore-scripts','--no-audit','--no-fund',join(temp,packed.filename),'typescript@5.9.3','@types/react@19','@types/react-dom@19','@types/three@0.184.1']);
 const installed=join(temp,'node_modules/motionforge');
 for(const path of ['dist/icons/index.d.ts','dist/renderer/index.d.ts','dist/player/Player.d.ts','dist/styles.css'])assert.ok(existsSync(join(installed,path)),path);
 writeFileSync(join(temp,'repro.mts'),'import { PlayIcon } from "motionforge/icons";\nimport { renderVideo } from "motionforge/renderer";\nvoid PlayIcon; void renderVideo;\n');
 const tsc=join(temp,'node_modules/typescript/bin/tsc');
 for(const [module,resolution] of [['nodenext','nodenext'],['esnext','bundler']])run(process.execPath,[tsc,'--noEmit','--strict','--lib','es2020,dom','--module',module,'--moduleResolution',resolution,'repro.mts']);
 const css=run(process.execPath,['--input-type=module','-e','import fs from "node:fs";const u=import.meta.resolve("motionforge/styles.css");if(!fs.existsSync(new URL(u)))throw Error("CSS missing");console.log(u)']);
 // Node does not execute CSS modules; resolve + file existence is the correct contract.
 assert.ok(css.includes('/dist/styles.css'));
 console.log(`PASS tarball: ${targets} export targets; strict NodeNext + Bundler; CSS resolution; npm consumer TS 5.9.3`);
}catch(error){console.error(error.stdout?.toString()??'');console.error(error.stderr?.toString()??'');throw error;}finally{rmSync(temp,{recursive:true,force:true});}

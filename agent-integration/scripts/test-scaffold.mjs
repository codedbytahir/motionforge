import {mkdtempSync,readFileSync,existsSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const cwd=mkdtempSync(join(tmpdir(),'motionforge-cli-')),cli=new URL('../../packages/create-motionforge/bin/index.js',import.meta.url).pathname;
const run=args=>spawnSync(process.execPath,[cli,...args],{cwd,encoding:'utf8',timeout:15000});
try{
 for(const template of ['blank','hello-world']){const result=run([template,'--yes','--template',template,'--no-tailwind']);assert.equal(result.status,0,result.stderr);const dir=join(cwd,template);assert.ok(existsSync(join(dir,'src/app/page.tsx')));assert.ok(existsSync(join(dir,'.agents/skills/trolic-motionforge-bridge/SKILL.md')));assert.ok(existsSync(join(dir,'AGENTS.md')));const pkg=JSON.parse(readFileSync(join(dir,'package.json')));assert.equal(pkg.dependencies.motionforge,'^1.5.0');assert.ok(pkg.dependencies.three);}
 writeFileSync(join(cwd,'blank','sentinel'),'preserve');assert.notEqual(run(['blank','--yes']).status,0);assert.equal(readFileSync(join(cwd,'blank','sentinel'),'utf8'),'preserve');
 assert.notEqual(run(['../escape','--yes']).status,0);assert.notEqual(run(['wrong','--yes','--template','../../bad']).status,0);
 const no=run(['no-skills','--yes','--no-skills']);assert.equal(no.status,0,no.stderr);assert.ok(!existsSync(join(cwd,'no-skills/.agents')));
 console.log('PASS both templates, skills, dependency alignment, noninteractive defaults, no-overwrite, path/template rejection and skills opt-out');
}finally{rmSync(cwd,{recursive:true,force:true});}

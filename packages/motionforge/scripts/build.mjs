import {rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
rmSync('dist',{recursive:true,force:true});
// Sequential declaration jobs prevent 5 TypeScript workers exhausting a 2GB runner.
for(let entry=0;entry<5;entry++){
 const r=spawnSync(process.execPath,['node_modules/tsup/dist/cli-default.js'],{stdio:'inherit',env:{...process.env,MOTIONFORGE_BUILD_ENTRY:String(entry),NODE_OPTIONS:'--max-old-space-size=512'}});
 if(r.status!==0)process.exit(r.status??1);
}
await import('./postbuild.mjs');

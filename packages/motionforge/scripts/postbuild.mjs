import {writeFileSync,readFileSync,existsSync} from 'node:fs';
writeFileSync('dist/styles.css','/* MotionForge 1.5: components use inline styles; optional host overrides. */\n');
for(const path of ['dist/index.js','dist/index.cjs','dist/trolic.js','dist/trolic.cjs','dist/player/Player.js','dist/icons/index.js','dist/icons/index.cjs'])writeFileSync(path,'"use client";\n'+readFileSync(path,'utf8'));

// Fail the build immediately if any declared conditional export is absent.
const manifest=JSON.parse(readFileSync('package.json','utf8'));
function verify(value){if(typeof value==='string'){if(!existsSync(value))throw new Error('Missing export target: '+value);}else for(const child of Object.values(value))verify(child);}
verify(manifest.exports);

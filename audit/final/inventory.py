import json,csv,hashlib
from pathlib import Path
root=Path('/home/user/motionforge')
rows=[]
for scope,base in [('root',root),('library',root/'packages/motionforge'),('cli',root/'packages/create-motionforge')]:
 d=json.loads((base/'package-lock.json').read_text())
 for loc,p in d.get('packages',{}).items():
  if not loc:continue
  actual=base/loc
  lic=p.get('license','UNKNOWN');files=[]
  if actual.is_dir():
   for f in actual.iterdir():
    if f.is_file() and f.name.lower().startswith(('license','licence','copying','notice')):
     files.append({'file':str(f.relative_to(root)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
  rows.append({'scope':scope,'location':loc,'version':p.get('version'),'license':lic,'dev':p.get('dev',False),'optional':p.get('optional',False),'resolved':p.get('resolved'),'integrity':p.get('integrity'),'notice_files':files})
(root/'audit/final/dependency-license-inventory.json').write_text(json.dumps(rows,indent=2))
from collections import Counter
print('license declarations:',Counter(str(r['license']) for r in rows))
paths=[]
for base in [root/'src',root/'packages',root/'.github',root/'agent-integration/scripts']:
 for p in base.rglob('*'):
  if not p.is_file() or any(x in p.parts for x in ['node_modules','dist','third-party']):continue
  if p.suffix not in ['.ts','.tsx','.js','.mjs','.py','.yml','.css','.html']:continue
  paths.append({'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'status':'NOT fully manually reviewed in this pass'})
(root/'audit/final/manual-coverage.json').write_text(json.dumps(paths,indent=2));print('first party files',len(paths))

"""Narrow local frontmatter/catalog/link checks; not the official skills-ref validator."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
catalog=json.loads((root/'agent-integration/skill-catalog.json').read_text())
assert len(catalog)==16
for item in catalog:
 p=root/item['path'];text=p.read_text();assert text.startswith('---\n')
 front,body=text[4:].split('\n---\n',1)
 fields=dict(line.split(': ',1) for line in front.splitlines())
 name=fields['name'];description=json.loads(fields['description'])
 assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',name) and len(name)<=64
 assert name==p.parent.name==item['name'];assert description==item['description'] and 1<=len(description)<=1024
 assert len(text.splitlines())<500
 for section in ['## Inputs','## Procedure','## Acceptance gate','## Avoid','## Shared references']:assert section in body
 assert (p.parent/'../../../agent-integration/AGENT-CONTRACT.md').resolve().is_file()
print('PASS: 16 skills, names/descriptions/catalog/sections/shared-reference paths; not host discovery or quality certification')

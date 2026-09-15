import json,sys
tid,name=sys.argv[1],sys.argv[2]
p=f'/private/tmp/claude-503/-Users-chensirui-Desktop--------------/e067014e-a870-4c2f-a9ce-cc9886bff47e/tasks/{tid}.output'
last=None
for line in open(p):
    try:o=json.loads(line)
    except: continue
    m=o.get('message',{}) if isinstance(o,dict) else {}
    c=m.get('content') if isinstance(m,dict) else None
    if o.get('type')=='assistant' and isinstance(c,list):
        for b in c:
            if b.get('type')=='text' and len(b.get('text',''))>1500: last=b['text']
open(f'build/v3_batches/reports/{name}.md','w').write(last or '')
print(name,len(last or ''))

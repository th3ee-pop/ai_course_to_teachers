"""复核 Kimi 备注输出并合并进 final/ok.json。用法：python3 review_notes.py"""
import json, re, glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
OLD = ['4＋3＋3', '4+3+3', '三种角色', '三角色', '三个主体', '三种主体', '管道（', '工具（', '主体（',
       '我想得到什么', 'AI需要扮演什么角色', '我能提供什么上下文', '这个问题的成功标准']
META = ['如图所示']  # 讲稿里说“这一页”是自然的


def parse(t):
    t = t.strip()
    t = re.sub(r'^```(json)?', '', t).strip(); t = re.sub(r'```$', '', t).strip()
    i, j = t.find('['), t.rfind(']')
    return json.loads(t[i:j + 1])


want = {}
for f in sorted(glob.glob(os.path.join(HERE, 'notes_in', 'in_*.json'))):
    for it in json.load(open(f, encoding='utf-8')): want[it['id']] = it
got, problems = {}, []
for f in sorted(glob.glob(os.path.join(HERE, 'notes_out', 'out_*.txt'))):
    txt = open(f, encoding='utf-8').read()
    if not txt.strip(): problems.append((os.path.basename(f), 'EMPTY')); continue
    try: items = parse(txt)
    except Exception as e: problems.append((os.path.basename(f), f'PARSE {e}')); continue
    for it in items:
        n = it.get('speaker_notes', '')
        pid = it['id']; pb = []
        if pid not in want: pb.append('unexpected id')
        if not (150 <= len(n) <= 420): pb.append(f'len {len(n)}')
        for o in OLD:
            if o in n: pb.append(f'old term {o}')
        for m in META:
            if m in n: pb.append(f'meta {m}')
        if re.search(r'P0\d\d|第\d+页', n): pb.append('page ref')
        if pb: problems.append((pid, pb))
        else: got[pid] = n
missing = [i for i in want if i not in got]
print('ok:', len(got), sorted(got)); print('missing:', missing)
for p in problems: print('PROBLEM', p)
final = os.path.join(HERE, 'final', 'ok.json')
arr = json.load(open(final, encoding='utf-8'))
for it in arr:
    if it['id'] in got: it['speaker_notes'] = got[it['id']]
json.dump(arr, open(final, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('final with notes:', sum('speaker_notes' in i for i in arr), '/', len(arr))

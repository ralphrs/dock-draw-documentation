import re,sys
def inline(t):
    # código com chave vira {noformat} inline não existe; usa {{ }} só sem chave
    def code(m):
        c=m.group(1)
        if any(x in c for x in '{}[]'): return '\u0000'+c+'\u0001'
        return '{{'+c+'}}'
    t=re.sub(r'`([^`]+)`',code,t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'*\1*',t)
    t=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'[\1|\2]',t)
    return t
out=[];blocks=[];fence=False
for line in open(sys.argv[1]).read().split('\n'):
    if line.startswith('```'):
        fence=not fence; out.append('{noformat}'); continue
    if fence: out.append(line); continue
    if line.startswith('# '): out.append('h1. '+inline(line[2:])); continue
    if line.startswith('## '): out.append('h2. '+inline(line[3:])); continue
    if re.match(r'^\|\s*-{3}',line): continue
    if line.startswith('|'):
        cells=[inline(c.strip()) for c in line.strip().strip('|').split('|')]
        out.append('|'+'|'.join(cells)+'|'); continue
    if line.startswith('- '): out.append('* '+inline(line[2:])); continue
    out.append(inline(line))
txt='\n'.join(out)
def split_keep(t):
    parts=re.split(r'(\{noformat\}\n.*?\n\{noformat\})',t,flags=re.S)
    r=[]
    for i,x in enumerate(parts):
        if i%2: r.append(x)
        else: r.extend(y for y in x.split('\n\n') if y.strip()!='' or True)
    return r
# trechos com chave: tira da linha e põe bloco {code} logo depois do parágrafo
res=[]
for para in re.split(r'\n\n(?![^{]*\{noformat\}(?:(?!\{noformat\}).)*$)',txt,flags=re.S) if False else split_keep(txt):
    if para.startswith('{noformat}'): res.append(para); continue
    codes=re.findall('\u0000(.*?)\u0001',para)
    para=re.sub('\u0000(.*?)\u0001',lambda m:'(trecho abaixo)',para)
    res.append(para)
    for c in codes: res.append('{code}'+c+'{code}')
print('\n\n'.join(res))

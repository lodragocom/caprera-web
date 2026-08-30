#!/bin/sh
# Riscarica i font da Google e li rimette in public/fonts/, per servirli da noi.
#
# Serve solo se cambiano le famiglie o i pesi usati in theme.css. I file
# scaricati vanno nel repo: sono parte del sito, non una dipendenza.
#
# Perche' non li chiediamo a Google a ogni visita: quella richiesta partirebbe
# PRIMA del consenso ai cookie, e Google riceverebbe l'IP di chiunque apra il
# sito — compreso chi poi rifiuta tutto.
set -e
cd "$(dirname "$0")/.."
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"
FAMIGLIE="family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500"
mkdir -p public/fonts && cd public/fonts
curl -s -A "$UA" "https://fonts.googleapis.com/css2?$FAMIGLIE&display=swap" -o /tmp/gf.css
python3 - <<'PY'
import re, urllib.request, pathlib
css = open('/tmp/gf.css', encoding='utf-8').read()
pezzi = re.split(r'/\*\s*([a-z-]+)\s*\*/', css)
tenere = {'latin', 'latin-ext'}   # il resto e' peso che a Caprera non serve
fuori, visti = [], set()
for i in range(1, len(pezzi), 2):
    sub, blocco = pezzi[i], pezzi[i+1]
    if sub not in tenere: continue
    m = re.search(r"url\((https://[^)]+\.woff2)\)", blocco)
    fam = re.search(r"font-family: '([^']+)'", blocco).group(1)
    peso = (re.search(r'font-weight: (\d+)', blocco) or [None,'400'])[1]
    nome = f"{fam.lower().replace(' ','-')}-{peso}-{sub}.woff2"
    if m and nome not in visti:
        urllib.request.urlretrieve(m.group(1), nome); visti.add(nome)
    fuori.append(blocco.replace(m.group(1), f'/fonts/{nome}').strip())
testa = open('font.css').read().split('*/')[0] + '*/\n\n' if pathlib.Path('font.css').exists() else ''
open('font.css','w').write(testa + '\n\n'.join(fuori) + '\n')
print(f'{len(visti)} file, font.css riscritto')
PY

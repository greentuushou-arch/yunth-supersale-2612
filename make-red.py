# index.html(ピンク版)から red.html(赤版)を作る。index.html を直したら実行する
from pathlib import Path

here = Path(__file__).parent
html = (here / 'index.html').read_text(encoding='utf8')
for before, after in [('data-theme="pink"', 'data-theme="red"'), ('images/fv-pink.webp', 'images/fv-red.webp')]:
    assert before in html, before
    html = html.replace(before, after)
(here / 'red.html').write_text(html, encoding='utf8', newline='\n')
print('red.html を作成しました')

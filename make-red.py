# 赤版で確定(2026-11-26)。index.html が本体。
# 以前に共有した red.html のURLでも見られるよう、index.html をそのまま red.html にコピーする。
# index.html を直したら実行する。
from pathlib import Path

here = Path(__file__).parent
html = (here / 'index.html').read_text(encoding='utf8')
assert 'data-theme="red"' in html, 'index.html が赤版になっていません'
(here / 'red.html').write_text(html, encoding='utf8', newline='\n')
print('red.html を更新しました')

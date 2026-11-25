(function () {
  'use strict';

  /* ===== 差し替えはここだけ ===== */
  // URLが決まったら入れる(空のあいだはボタンを押しても移動しない)
  var LINKS = { pdrnCoupon: '', serumCoupon: '', skinCoupon: '', boostCoupon: '', entry: '' };
  var ITEM_URL = 'https://item.rakuten.co.jp/yunth/';
  // ガチャで当たるアイテムをページに出さない場合は false
  var SHOW_PRIZE = true;

  var T = function (s) { return new Date('2026-' + s + '+09:00').getTime(); };
  var TERMS = {
    pdrn: [T('12-02T10:00:00'), T('12-02T23:59:59'), '12/2(水) 10:00', '23:59'],
    serum: [T('12-03T10:00:00'), T('12-11T09:59:59'), '12/3(木) 10:00', '12/11(金) 9:59'],
    skin: [T('12-03T10:00:00'), T('12-11T09:59:59'), '12/3(木) 10:00', '12/11(金) 9:59'],
    boost: [T('12-03T10:00:00'), T('12-11T01:59:59'), '12/3(木) 10:00', '12/11(金) 1:59'],
    deal: [T('12-04T10:00:00'), T('12-11T09:59:59'), '12/4(金) 10:00', '12/11(金) 9:59'],
    'new': [T('12-04T20:00:00'), T('12-11T01:59:59'), '12/4(金) 20:00', '12/11(金) 1:59']
  };

  var G = {
    vc: ['10000000', 'serum-vc.webp', '生VC美白⁠<sup>※1</sup><wbr>美容液⁠<sup>＊</sup>'],
    va: ['yb-116-001', 'serum-va.webp', '生VA美容液⁠<sup>＊</sup>'],
    az: ['yb-125-001', 'serum-az.webp', '生AZ美容液'],
    pdrn: ['yb-126-001', 'serum-pdrn.webp', '生PDRN⁠<sup>※2</sup><wbr>美容液'],
    box: ['yb-127-001', '', 'ピュアマスク<br>大容量<wbr>ボックス'],
    mask: ['ys-r129', 'ys-r129.webp', 'ピュアマスク<br>4袋／<wbr>8袋セット'],
    boost: ['yth-260', 'deepboost-sq.webp', '美顔器<br>Deep Boost']
  };
  // img: 対象商品の切り抜き画像(images/ に置いてファイル名を入れる。横長 1200×600px 目安)
  var GACHA = [
    { m: '12/3', w: '木', day: '12-03', img: '', items: ['vc'], prize: '今治タオル ＆ 乳液ミニ' },
    { m: '12/4', w: '金', day: '12-04', img: '', items: ['vc', 'va', 'az', 'pdrn', 'box', 'mask', 'boost'], prize: 'Yunthオリジナル トートバッグ' },
    { m: '12/5', w: '土', day: '12-05', img: '', items: ['vc', 'va', 'az', 'pdrn', 'box', 'mask', 'boost'], prize: '美容液収納ボックス<br>＆ シュシュ(ピンク)' },
    { m: '12/10', w: '木', day: '12-10', img: '', items: ['vc', 'va', 'az', 'pdrn', 'boost'], prize: 'スクエアシートマスク10枚<br>＆ シュシュ(ベージュ)' }
  ].map(function (g) {
    return Object.assign({}, g, { start: T(g.day + 'T20:00:00'), end: T(g.day + 'T21:59:59') });
  });

  // 価格は2026/11/25時点の商品ページ(税込)
  var SERUMS = [
    ['vc', '1ml×28包', '3,960', '3,168'], ['va', '1g×28包', '4,950', '3,960'],
    ['az', '1g×28包', '3,960', '3,168'], ['pdrn', '1ml×28包', '3,960', '3,168']
  ];
  var SKINS = [
    ['yb-120-001', 'フュージョン<wbr>クレンジング', '120ml', '3,289', '2,303'],
    ['yb-115-001', '生VCホワイト<wbr>クリアフォーム', '120g', '3,960', '2,772'],
    ['yb-117-001', '生VCホワイト乳液', '75ml', '3,960', '2,772'],
    ['10000007', '生VC美白⁠<sup>※1</sup><wbr>クリーム⁠<sup>＊</sup>', '30g', '3,960', '2,772']
  ];
  var DEALS = [
    ['yb-119-001', '飲むビタミンC リポソーム', '2.5g×28包', 50],
    ['ys-r184', '美顔器 Deep&nbsp;Boost<wbr>セット', '生VC美白⁠<sup>※1</sup>美容液⁠<sup>＊</sup>、<wbr>ピュアマスク4種<wbr>各1袋', 25, 'deepboost-sq.webp'],
    ['111-01', '生VC美白⁠<sup>※1</sup>化粧水⁠<sup>＊</sup>', '120ml', 20],
    ['112', '生VC<wbr>トーンアップUV', '全3色 30g', 20],
    ['yb-123-001', 'クッション<wbr>ファンデーション<br>エアレス', '15g パフ付き', 20]
  ];
  /* ===== ここまで ===== */

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var plain = function (s) { return s.replace(/⁠?<sup>.*?<\/sup>/g, '').replace(/<wbr>/g, '').replace(/<br>/g, ' '); };
  var src = function (f) { return /^https/.test(f) ? f : 'images/' + f; };
  var url = function (c) { return ITEM_URL + c + '/'; };
  var off = function (n, u) {
    return '<span class="off"><b>' + n + '</b><span class="off__u"><i class="p">%</i>' +
      (u ? '<i class="k">' + u + '</i>' : '<i class="o">OFF</i>') + '</span></span>';
  };

  // 確認用: ?now=2026-12-03T20:30 で日時を固定してスタートできる
  var q = new URLSearchParams(location.search).get('now');
  var shift = q ? new Date(q + ':00+09:00').getTime() - Date.now() : 0;
  var now = function () { return Date.now() + (shift || 0); };

  /* ---- 商品の描画 ---- */
  $('[data-days]').innerHTML = GACHA.map(function (g, i) {
    var prize = SHOW_PRIZE ? '<p class="day__lbl">当たるアイテム</p><p class="day__prize">' + g.prize + '</p>' : '';
    var items = g.items.map(function (k) {
      var it = G[k];
      return '<a href="' + url(it[0]) + '" target="_blank" rel="noopener">' + it[2].replace(/<br>/g, '') + '</a>';
    }).join('');
    return '<article class="day"><div class="day__top"><p class="day__d">' + g.m + '<small>(' + g.w + ')</small><em>20:00〜22:00</em></p><p class="state" data-gstate="' + i + '"></p></div>' +
      '<div class="day__body">' + prize + '<p class="day__lbl">対象商品</p>' + (g.img ? '<img class="slot__img" src="' + src(g.img) + '" alt="対象商品" loading="lazy">' : '<div class="slot">対象商品の画像が入ります</div>') + '<div class="tgt">' + items + '</div></div></article>';
  }).join('');

  // 日別カードのスライド
  var days = $('[data-days]'), cards = [].slice.call(days.children), dayIdx = 0;
  $('[data-daytabs]').innerHTML = GACHA.map(function (g) {
    return '<button type="button"><b>' + g.m + '</b>(' + g.w + ')</button>';
  }).join('');
  var dayTabs = $$('[data-daytabs] button');
  function markDay(i) {
    dayIdx = i;
    dayTabs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-pressed', k === i); });
    cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
    $('[data-dayprev]').disabled = i === 0;
    $('[data-daynext]').disabled = i === cards.length - 1;
  }
  function goDay(i, behavior) {
    var k = Math.max(0, Math.min(cards.length - 1, i));
    var c = cards[k];
    days.scrollTo({ left: c.offsetLeft - (days.clientWidth - c.offsetWidth) / 2, behavior: behavior || 'smooth' });
    markDay(k);
  }
  var dayTimer;
  days.addEventListener('scroll', function () {
    clearTimeout(dayTimer);
    dayTimer = setTimeout(function () {
      var mid = days.scrollLeft + days.clientWidth / 2;
      var dist = cards.map(function (c) { return Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); });
      markDay(dist.indexOf(Math.min.apply(null, dist)));
    }, 90);
  }, { passive: true });
  dayTabs.forEach(function (t, i) { t.addEventListener('click', function () { goDay(i); }); });
  $('[data-dayprev]').addEventListener('click', function () { goDay(dayIdx - 1); });
  $('[data-daynext]').addEventListener('click', function () { goDay(dayIdx + 1); });
  // 最初は、当日または次に開催する日のカードを表示
  var firstDay = Math.max(0, GACHA.findIndex(function (g) { return now() <= g.end; }));
  goDay(firstDay, 'auto');
  window.addEventListener('resize', function () { goDay(dayIdx, 'auto'); });
  window.addEventListener('load', function () { goDay(dayIdx, 'auto'); });

  var price = function (a, b) {
    return '<p class="item__p"><span class="num">' + a + '</span>円(税込)<br>クーポン利用で<strong><b>' + b + '</b><em>円</em></strong></p>';
  };
  $('[data-serums]').innerHTML = SERUMS.map(function (s) {
    var it = G[s[0]];
    return '<a class="item" href="' + url(it[0]) + '" target="_blank" rel="noopener"><img src="' + src(it[1]) + '" width="720" height="720" alt="' + plain(it[2]) + '" loading="lazy">' +
      '<p class="item__n">' + it[2] + '</p><p class="item__v">' + s[1] + '</p>' + price(s[2], s[3]) + '<span class="btn btn--hot btn--s">商品ページへ</span></a>';
  }).join('');
  $('[data-skins]').innerHTML = SKINS.map(function (s) {
    return '<a class="row" href="' + url(s[0]) + '" target="_blank" rel="noopener"><img src="images/' + s[0] + '.webp" width="640" height="640" alt="' + plain(s[1]) + '" loading="lazy">' +
      '<div><p class="item__n">' + s[1] + '</p><p class="item__v">' + s[2] + '</p>' + price(s[3], s[4]) + '<span class="btn btn--hot btn--s">商品ページへ</span></div></a>';
  }).join('');
  var back = function (n) { return '<p class="back"><span>ポイント</span>' + off(n, '還元') + '</p>'; };
  var dealInner = function (d) {
    return '<img src="images/' + (d[4] || d[0] + '.webp') + '" width="640" height="640" alt="' + plain(d[1]) + '" loading="lazy"><p class="item__n">' + d[1] + '</p><p class="item__v">' + d[2] + '</p>' + back(d[3]) + '<span class="btn btn--hot btn--s">商品ページへ</span>';
  };
  $('[data-deal-hero]').innerHTML = '<a class="deal__hero" href="' + url(DEALS[0][0]) + '" target="_blank" rel="noopener">' + dealInner(DEALS[0]) + '</a>';
  $('[data-deals]').innerHTML = DEALS.slice(1).map(function (d) {
    return '<a class="item" href="' + url(d[0]) + '" target="_blank" rel="noopener">' + dealInner(d) + '</a>';
  }).join('');

  $$('[data-item]').forEach(function (a) { a.href = url(a.dataset.item); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-link]').forEach(function (a) {
    var u = LINKS[a.dataset.link];
    if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; return; }
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // 先行企画は終わったら消す
  var isPdrnOver = now() > TERMS.pdrn[1];
  if (isPdrnOver) $('#pdrn').hidden = true;

  /* ---- 早見表(12/2〜12/11) ---- */
  var DOW = ['水', '木', '金', '土', '日', '月', '火', '水', '木', '金'];
  var jst = new Date(now() + 9 * 36e5);
  var today = jst.getUTCFullYear() === 2026 && jst.getUTCMonth() === 11 ? jst.getUTCDate() : 0;
  $('[data-cal-days]').innerHTML = DOW.map(function (w, i) {
    var c = (w === '土' ? 'sat ' : w === '日' ? 'sun ' : '') + (today === i + 2 ? 'is-today' : '');
    return '<div class="' + c + '"><b>' + (i + 2) + '</b><span>' + w + '</span></div>';
  }).join('');
  var ROWS = [
    { to: 'pdrn', t: '先行 生PDRN⁠<sup>※</sup>美容液', s: '12/2 10:00〜23:59', b: [[2, 2]], c: '#e4e7ee', pre: 1 },
    { to: 'gacha', t: 'Yunthガチャ', s: '20:00〜22:00', b: [[3, 3], [4, 4], [5, 5], [10, 10]], c: '#f0c66a' },
    { to: 'serum', t: '美容液4種 20%OFFクーポン', s: '12/3 10:00〜12/11 9:59', b: [[3, 11]], c: 'var(--bar1)' },
    { to: 'serum', t: '美容液4種 ポイント10倍', s: '3日・4日・5日・10日', b: [[3, 3], [4, 4], [5, 5], [10, 10]], c: '#f0c66a' },
    { to: 'skin', t: 'スキンケア4商品 30%OFFクーポン', s: '12/3 10:00〜12/11 9:59', b: [[3, 11]], c: 'var(--bar2)' },
    { to: 'boost', t: 'Deep Boost 特別セット 32%OFF', s: '12/3 10:00〜12/11 1:59', b: [[3, 11]], c: 'var(--bar1)' },
    { to: 'deal', t: '楽天スーパーDEAL 最大50%還元', s: '12/4 10:00〜12/11 9:59', b: [[4, 11]], c: '#f0c66a' },
    { to: 'new', t: '新規購入者限定 ポイント+9倍', s: '12/4 20:00〜12/11 1:59', b: [[4, 11]], c: 'var(--bar2)' }
  ];
  $('[data-cal-rows]').innerHTML = ROWS.filter(function (r) { return !(r.pre && isPdrnOver); }).map(function (r) {
    var bars = r.b.map(function (b) { return '<i style="--c:' + r.c + ';grid-column:' + (b[0] - 1) + '/' + b[1] + '"></i>'; }).join('');
    return '<a class="cal__row" href="#' + r.to + '"><p><span>' + r.t + '</span><small>' + r.s + '</small></p><div class="cal__track">' + bars + '</div></a>';
  }).join('') + (isPdrnOver ? '' : '<p class="note" style="text-align:center;margin-top:12px">※サーモン抽出物：DNA-Na(整肌)</p>');

  // スマホのカレンダー開閉(メニューから来たときは自動で開く)
  var calSec = $('#calendar'), calBtn = $('[data-cal-btn]');
  function setCal(open) {
    calSec.classList.toggle('is-open', open);
    calBtn.setAttribute('aria-expanded', open);
  }
  calBtn.addEventListener('click', function () { setCal(!calSec.classList.contains('is-open')); });
  $$('a[href="#calendar"]').forEach(function (a) { a.addEventListener('click', function () { setCal(true); }); });

  /* ---- 左メニュー ---- */
  var secs = $$('section[data-title]').filter(function (s) { return !s.hidden; });
  $('[data-menu]').innerHTML = secs.map(function (s) {
    return '<li><a href="#' + s.id + '">' + s.dataset.title + '</a></li>';
  }).join('');

  /* ---- 右メニュー ---- */
  var OFFERS = [
    { to: 'gacha', t: 'Yunthガチャ', v: '<b>500</b><i>名様</i>', cls: 'g' },
    { to: 'serum', t: '美容液4種<br>クーポン', v: off(20) },
    { to: 'skin', t: 'スキンケア<br>クーポン', v: off(30) },
    { to: 'boost', t: 'Deep Boost<br>クーポン', v: off(32) },
    { to: 'deal', t: '楽天スーパー<br>DEAL 最大', v: off(50, '還元') },
    { to: 'new', t: 'はじめての方<br>ポイント', v: '<b>+9</b><i>倍</i>' }
  ];
  $('[data-offers]').innerHTML = OFFERS.map(function (o) {
    return '<a href="#' + o.to + '" class="' + (o.cls || '') + '" data-offer="' + o.to + '"><p>' + o.t + '<small></small></p><span class="v">' + o.v + '</span></a>';
  }).join('');

  /* ---- 現在地 ---- */
  var navs = $$('.menu a,.dock a');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      navs.forEach(function (a) { a.classList.toggle('is-cur', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.concat($('#top')).forEach(function (s) { io.observe(s); });
  new IntersectionObserver(function (es) {
    $('[data-dock]').classList.toggle('is-show', !es[0].isIntersecting);
  }, { rootMargin: '-120px 0px 0px 0px' }).observe($('#top'));

  /* ---- 時計 ---- */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  function setState(el, s) {
    el.textContent = s[0];
    el.classList.toggle('is-live', s[1] === 1);
    el.classList.toggle('is-end', s[1] === 2);
  }
  function termState(k, n) {
    var t = TERMS[k];
    if (n < t[0]) return [t[2] + ' スタート', 0];
    if (n <= t[1]) return ['開催中 ' + t[3] + 'まで', 1];
    return ['終了しました', 2];
  }
  function gachaState(g, n) {
    if (n < g.start) return [g.day === '12-' + pad(today) ? '本日 20:00から' : '20:00 スタート', 0];
    return n <= g.end ? ['開催中 22:00まで', 1] : ['終了しました', 2];
  }
  function tick() {
    var n = now();
    $$('[data-state]').forEach(function (el) { setState(el, termState(el.dataset.state, n)); });
    $$('[data-gstate]').forEach(function (el) { setState(el, gachaState(GACHA[+el.dataset.gstate], n)); });
    var g = GACHA.find(function (x) { return n <= x.end; });
    var live = g && n >= g.start;
    var html = '';
    if (g) {
      var d = (live ? g.end : g.start) - n, D = Math.floor(d / 864e5);
      html = (D ? D + '<i>日</i>' : '') + pad(Math.floor(d / 36e5) % 24) + '<i>時間</i>' + pad(Math.floor(d / 6e4) % 60) + '<i>分</i>' + pad(Math.floor(d / 1e3) % 60) + '<i>秒</i>';
    }
    $$('[data-gcd]').forEach(function (c) {
      c.hidden = !g;
      if (!g) return;
      c.querySelector('.gcd__l').textContent = live ? 'ガチャ 22:00まで あと' : 'ガチャ ' + g.m + '(' + g.w + ') 20:00まで';
      c.querySelector('.gcd__n').innerHTML = html;
    });
    $$('[data-offer]').forEach(function (a) {
      var k = a.dataset.offer;
      var s = k === 'gacha' ? (!g ? ['終了しました', 2] : live ? ['開催中', 1] : [g.m + ' 20:00〜', 0]) : termState(k, n);
      a.querySelector('small').textContent = s[1] === 1 ? '開催中' : s[1] === 2 ? '終了しました' : k === 'gacha' ? s[0] : TERMS[k][2].replace(/\(.\)/, '') + '〜';
      a.classList.toggle('is-live', s[1] === 1);
      a.classList.toggle('is-end', s[1] === 2);
    });
  }
  tick();
  setInterval(tick, 1000);
})();

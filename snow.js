// 粉雪: FVの絵の上(下の2枠にはかからない)と、PC両脇の背景
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TWO_PI = Math.PI * 2;
  var RAIL_MIN_WIDTH = 1220;

  function random(min, max) { return min + Math.random() * (max - min); }

  function createFlake(w, h, atTop) {
    var r = random(0.7, 2.3);
    return {
      x: random(0, w), y: atTop ? -6 : random(0, h), r: r,
      speed: 14 + r * 13, sway: random(6, 18), phase: random(0, TWO_PI),
      alpha: random(0.45, 0.95)
    };
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{density:number, max:number, fadeFrom:number, isActive:function():boolean}} opt
   */
  function startSnow(canvas, opt) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, flakes = [], last = 0, isVisible = true, isRunning = false;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(opt.max, Math.round(w * h * opt.density));
      flakes = Array.from({ length: count }, function () { return createFlake(w, h, false); });
    }

    function draw(time) {
      if (!isVisible || document.hidden || !opt.isActive()) { isRunning = false; return; }
      var dt = Math.min(0.05, (time - last) / 1000 || 0);
      last = time;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      flakes = flakes.map(function (f) {
        var y = f.y + f.speed * dt;
        return y > h + 4 ? createFlake(w, h, true) : Object.assign({}, f, { y: y, phase: f.phase + dt * 0.9 });
      });
      flakes.forEach(function (f) {
        var fade = f.y > h * opt.fadeFrom ? Math.max(0, 1 - (f.y - h * opt.fadeFrom) / (h * (1 - opt.fadeFrom))) : 1;
        ctx.globalAlpha = f.alpha * fade;
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(f.phase) * f.sway, f.y, f.r, 0, TWO_PI);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    function run() {
      if (isRunning || !isVisible || document.hidden || !opt.isActive()) return;
      isRunning = true;
      last = 0;
      requestAnimationFrame(draw);
    }

    resize();
    run();
    window.addEventListener('resize', function () { resize(); run(); });
    document.addEventListener('visibilitychange', run);
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
      run();
    }).observe(canvas);
  }

  var fv = document.querySelector('[data-snow="fv"]');
  var bg = document.querySelector('[data-snow="bg"]');
  startSnow(fv, { density: 1 / 3600, max: 120, fadeFrom: 0.9, isActive: function () { return true; } });
  startSnow(bg, { density: 1 / 5200, max: 320, fadeFrom: 0.94, isActive: function () { return innerWidth >= RAIL_MIN_WIDTH; } });
})();

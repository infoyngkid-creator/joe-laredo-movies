(() => {
  const S = window.SITE || { films: [], socials: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t = '') => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- content ---------- */
  const filmHTML = (f, i) => `
    <button class="film" type="button" data-i="${i}" aria-label="Play ${esc(f.title)}">
      <div class="film-poster">
        ${f.poster ? `<img src="${esc(f.poster)}" alt="" loading="lazy">` : `<div class="ph"><span>${esc(f.title)}</span></div>`}
        <div class="poster-light" aria-hidden="true"></div>
        <div class="poster-lid" aria-hidden="true"><span class="poster-seam"></span><span class="poster-latch"></span></div>
        <span class="play-stamp">&#9654; Play</span>
      </div>
      <div class="film-meta">
        <h3 class="film-title">${esc(f.title)}</h3>
        <span class="film-info">${[f.year, f.runtime, f.role].filter(Boolean).map(esc).join(' &mdash; ')}</span>
      </div>
      ${f.logline ? `<p class="film-logline">${esc(f.logline)}</p>` : ''}
    </button>`;

  const films = S.films || [];
  const featIdx = Math.max(0, films.findIndex(f => f.featured));
  if (films.length) {
    $('#featured').innerHTML = filmHTML(films[featIdx], featIdx);
    $('#film-grid').innerHTML = films.map((f, i) => i === featIdx ? '' : filmHTML(f, i)).join('');
  }
  if (S.email) { const m = $('#contact-mail'); m.textContent = S.email; m.href = 'mailto:' + S.email; }
  $('#socials').innerHTML = (S.socials || []).filter(s => s.url && s.url !== '#').map(s =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
  $('#year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-born]').forEach(el => {
    const b = new Date(el.dataset.born), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    el.textContent = a;
  });

  /* ---------- player with countdown leader ---------- */
  const player = $('#player'), frame = $('#player-frame'), leader = $('#leader'), num = $('#leader-num');
  let timer = null, lastFocus = null;

  function openFilm(f) {
    lastFocus = document.activeElement;
    player.hidden = false; document.body.style.overflow = 'hidden';
    frame.innerHTML = ''; leader.style.display = '';
    $('.player-close').focus();
    let n = reduce ? 1 : 3; const start = performance.now();
    num.textContent = n;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const left = (reduce ? 1 : 3) - Math.floor(t);
      leader.style.setProperty('--a', ((t % 1) * 360) + 'deg');
      if (left !== n) { n = left; num.textContent = Math.max(n, 1); }
      if (n <= 0) { leader.style.display = 'none'; showFilm(f); return; }
      timer = requestAnimationFrame(tick);
    };
    timer = requestAnimationFrame(tick);
  }
  function showFilm(f) {
    frame.innerHTML = f.youtubeId
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(f.youtubeId)}?autoplay=1&rel=0&modestbranding=1"
           title="${esc(f.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<div class="player-soon"><h3>Coming Soon</h3><p>${esc(f.title)}</p></div>`;
  }
  function closeFilm() {
    cancelAnimationFrame(timer); frame.innerHTML = '';
    player.hidden = true; document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.film');
    if (b) openFilm(films[+b.dataset.i]);
  });
  $('.player-close').addEventListener('click', closeFilm);
  player.addEventListener('click', e => { if (e.target === player) closeFilm(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !player.hidden) closeFilm(); });

  /* ---------- cigarette burn ---------- */
  const burn = $('.burn');
  const flashBurn = () => { if (reduce) return; burn.classList.remove('flash'); void burn.offsetWidth; burn.classList.add('flash'); };

  /* ---------- intro: scroll-driven trunk scene ---------- */
  const intro = $('#intro');
  const canvas = $('#scene-canvas'), ctx = canvas.getContext('2d');
  const FRAMES = 275, FREEZE = 99, FOCUS_X = .6;
  const src = i => `assets/scene/${String(i + 1).padStart(3, '0')}.webp`;
  const imgs = new Array(FRAMES);
  const scene = { f: 0 };
  let drawn = -1;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    drawn = -1; draw();
  }
  function draw() {
    let i = Math.round(scene.f);
    while (i > 0 && !(imgs[i] && imgs[i].ok)) i--;          // nearest loaded frame
    const img = imgs[i];
    if (!img || !img.ok || i === drawn) return;
    drawn = i;
    const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
    const x = Math.min(0, Math.max(cw - w, cw / 2 - w * FOCUS_X)), y = (ch - h) / 2;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }
  function load(i) {
    return new Promise(res => {
      if (imgs[i]) return res();
      const im = new Image(); imgs[i] = im;
      im.onload = () => { im.ok = true; if (Math.abs(i - scene.f) < 3 || drawn < 0) { drawn = -1; draw(); } res(); };
      im.onerror = res; im.src = src(i);
    });
  }
  async function loadAll() {
    const bar = $('#scene-load-bar');
    await Promise.all([load(0), load(FREEZE)]);
    const order = [];
    for (let step = 16; step >= 1; step = step / 2 | 0) {      // coarse → fine, so scrubbing works early
      for (let i = 0; i < FRAMES; i += step) if (!imgs[i]) order.push(i);
      if (step === 1) break;
    }
    let done = 2;
    const worker = async () => { while (order.length) { await load(order.shift()); bar.style.width = (++done / FRAMES * 100) + '%'; } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    bar.style.opacity = 0;
  }
  window.addEventListener('resize', size);

  const staticScene = () => { intro.classList.add('static'); scene.f = FREEZE; load(FREEZE).then(size); };

  if (!window.gsap) { staticScene(); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (reduce) {
    staticScene();
  } else {
    size(); loadAll();
    const render = () => draw();
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom bottom', scrub: .6 }
    });
    tl.to('.scene-hint', { opacity: 0, duration: .04 }, 0)
      .to(scene, { f: FREEZE, duration: .5, onUpdate: render }, 0)
      // freeze frame + name
      .fromTo('.scene-flash', { opacity: 0 }, { opacity: .85, duration: .01 }, .5)
      .to('.scene-flash', { opacity: 0, duration: .05 }, .51)
      .fromTo(canvas, { filter: 'none' }, { filter: 'brightness(1.45) saturate(1.4) sepia(.18)', duration: .02 }, .5)
      .to('.kicker', { opacity: 1, duration: .04 }, .52)
      .fromTo('.logo', { opacity: 0, scale: 1.4, transformOrigin: '0% 100%' }, { opacity: 1, scale: 1, duration: .04, ease: 'back.out(2.5)' }, .54)
      .to('.sub', { opacity: 1, duration: .04 }, .58)
      // hold … then the trunk closes
      .to('.intro-title > *', { opacity: 0, y: -20, duration: .05, stagger: .01 }, .74)
      .to(canvas, { filter: 'none', duration: .04 }, .74)
      .to(scene, { f: FRAMES - 1, duration: .26, onUpdate: render }, .74)
      .to('.skip', { opacity: 0, duration: .04 }, .92);
  }

  if (reduce) { document.querySelectorAll('.poster-lid').forEach(l => l.remove()); return; }

  // Chapter cards
  gsap.utils.toArray('.chapter').forEach(ch => {
    const t = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 65%', toggleActions: 'play none none reverse' } });
    t.from($('.chapter-num', ch), { y: 24, opacity: 0, duration: .5, ease: 'power2.out' })
     .from($('.chapter-title', ch), { scale: 1.3, opacity: 0, duration: .45, ease: 'power4.out' }, '-=.25')
     .to($('.chapter-title', ch), { opacity: .55, duration: .05, repeat: 3, yoyo: true, ease: 'steps(1)' });
    ScrollTrigger.create({ trigger: ch, start: 'top 40%', onEnter: flashBurn });
  });

  // Films: each poster is a trunk that opens as you scroll
  gsap.utils.toArray('.film').forEach(el => {
    const poster = $('.film-poster', el), lid = $('.poster-lid', el), seam = $('.poster-seam', el),
          light = $('.poster-light', el), media = $('img, .ph', poster), meta = el.querySelectorAll('.film-meta, .film-logline');
    gsap.set(meta, { opacity: 0, y: 24 });
    const t = gsap.timeline({ scrollTrigger: { trigger: poster, start: 'top 85%', end: 'top 25%', scrub: .6 } });
    t.fromTo(seam, { opacity: 0 }, { opacity: 1, duration: .12 })
     .to(lid, { rotateX: 4, duration: .08 })
     .to(lid, { rotateX: 2, duration: .06 })
     .to(lid, { rotateX: 96, duration: .55, ease: 'power2.inOut' })
     .to(seam, { opacity: 0, duration: .1 }, '<.15')
     .fromTo(light, { opacity: 0 }, { opacity: 1, duration: .15 }, '<')
     .to(light, { opacity: 0, duration: .35 })
     .fromTo(media, { scale: 1.18, filter: 'brightness(.25)' }, { scale: 1, filter: 'brightness(1)', duration: .6 }, '<-.3');
    gsap.to(meta, { opacity: 1, y: 0, stagger: .1, duration: .7, ease: 'power2.out',
      scrollTrigger: { trigger: poster, start: 'top 40%' } });
  });

  // Freeze frame
  const freeze = $('.freeze');
  ScrollTrigger.create({
    trigger: freeze, start: 'top 50%',
    onEnter: () => {
      freeze.classList.add('frozen');
      gsap.fromTo('.freeze-img', { filter: 'brightness(3)' }, { filter: '', duration: .4, clearProps: 'filter' });
    },
    onLeaveBack: () => freeze.classList.remove('frozen')
  });
  gsap.from('.about-text > *', { y: 30, opacity: 0, stagger: .12, duration: .8, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-text', start: 'top 80%' } });

  // Services
  gsap.from('.services li', { x: -60, opacity: 0, stagger: .15, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: '.services', start: 'top 80%' } });

  // Credits roll
  gsap.from('.credits p', { y: 40, opacity: 0, stagger: .2, duration: .8, ease: 'power2.out',
    scrollTrigger: { trigger: '.credits', start: 'top 85%' } });
})();

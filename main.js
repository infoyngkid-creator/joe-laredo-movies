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

  /* ---------- animation ---------- */
  const intro = $('#intro');
  if (!window.gsap) {           // CDN failed: show everything statically
    document.documentElement.classList.remove('js');
    intro.classList.add('open');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Trunk opens
  const tl = gsap.timeline({ onComplete: () => intro.classList.add('open') });
  tl.set('.lid', { rotateX: 0 })
    .set('.figures', { yPercent: 18 })
    .set('.sky', { filter: 'brightness(2.4)' })
    .to('.seam', { opacity: 1, duration: .08, repeat: 5, yoyo: true, ease: 'steps(1)' }, .3)
    .to('.seam', { opacity: 1, duration: .1 })
    .to('.lid', { rotateX: 6, duration: .18, ease: 'power2.out' })            // the latch pops
    .to('.lid', { rotateX: 3, duration: .25, ease: 'power1.inOut' })
    .to('.lid', { rotateX: 82, duration: 1.5, ease: 'power3.inOut' }, '+=.25')
    .to('.seam', { opacity: 0, duration: .3 }, '<.2')
    .to('.sky', { filter: 'brightness(1)', duration: 1.4, ease: 'power2.out' }, '<.3')
    .to('.figures', { yPercent: 0, duration: 1.6, ease: 'power3.out' }, '<.1')
    .to('.kicker', { opacity: 1, duration: .5 }, '-=.6')
    .fromTo('.logo', { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: .35, ease: 'back.out(2.5)' }, '-=.2')
    .to('.sub', { opacity: 1, duration: .5 }, '+=.1')
    .to('.scroll-cue', { opacity: 1, duration: .5 });

  if (reduce || location.hash) tl.progress(1);
  $('.skip').addEventListener('click', () => tl.progress(1));

  // Leaving the trunk: parallax
  gsap.timeline({ scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom top', scrub: true } })
    .to('.figures', { yPercent: 25, ease: 'none' }, 0)
    .to('.intro-title', { yPercent: -60, opacity: 0, ease: 'none' }, 0)
    .to('.sky', { scale: 1.15, ease: 'none' }, 0);

  if (reduce) return;

  // Chapter cards
  gsap.utils.toArray('.chapter').forEach(ch => {
    const t = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 65%', toggleActions: 'play none none reverse' } });
    t.from($('.chapter-num', ch), { y: 24, opacity: 0, duration: .5, ease: 'power2.out' })
     .from($('.chapter-title', ch), { scale: 1.3, opacity: 0, duration: .45, ease: 'power4.out' }, '-=.25')
     .to($('.chapter-title', ch), { opacity: .55, duration: .05, repeat: 3, yoyo: true, ease: 'steps(1)' });
    ScrollTrigger.create({ trigger: ch, start: 'top 40%', onEnter: flashBurn });
  });

  // Films
  gsap.utils.toArray('.film').forEach(el => {
    gsap.from(el, { y: 60, opacity: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
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

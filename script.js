(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');

  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuButton.focus(); }
    });
  }

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // The map shows by itself: it starts loading just before the visitor scrolls to it,
  // so it is already visible on arrival without slowing the first load.
  const mapFrame = document.querySelector('#map-frame iframe[data-src]');
  if (mapFrame) {
    const showMap = () => { mapFrame.src = mapFrame.dataset.src; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (entries.some((en) => en.isIntersecting)) { showMap(); obs.disconnect(); }
      }, { rootMargin: '900px 0px' }).observe(mapFrame);
    } else showMap();
  }

  // Gentle fade-in on scroll (skipped for people who prefer reduced motion)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section > *');
    document.body.classList.add('js-ready');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.08 });
    targets.forEach((t) => { t.classList.add('reveal'); io.observe(t); });
  }
})();

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

  // The Google map is only loaded when the visitor asks for it.
  // This keeps the first load fast and saves mobile data.
  const mapButton = document.getElementById('map-load');
  const mapFrame = document.getElementById('map-frame');
  if (mapButton && mapFrame) {
    mapButton.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.title = 'Map showing HRX Gold Fitness in Mainpura, Patna';
      iframe.src = 'https://www.google.com/maps?q=HRX%20Gold%20Fitness%20Mainpura%20Patna&output=embed';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.loading = 'lazy';
      mapFrame.replaceChildren(iframe);
    });
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

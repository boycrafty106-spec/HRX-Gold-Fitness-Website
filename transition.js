/* HRX Gold Fitness – scroll-scrubbed white-screen transition.
 * Isolated module. Activates only on [data-hrx-transition] and only if it sits
 * exactly between data-prev and data-next. GSAP + ScrollTrigger are self-hosted
 * (./vendor) and downloaded after the page has loaded, so first paint is untouched.
 *
 * Options (data-attributes on the section):
 *   data-prev / data-next   selectors of the two approved sections
 *   data-direction          "center" (card grows from centre) | "bottom" (rises from bottom)
 *   data-from-scale         starting size of the white layer for "center" (0.1 – 0.9)
 * Scroll length is CSS: --hrx-distance (phones 170svh, desktop 220svh).
 */
(() => {
  'use strict';
  const root = document.querySelector('[data-hrx-transition]');
  if (!root) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prev = root.dataset.prev, next = root.dataset.next;
  if ((prev && !root.previousElementSibling?.matches(prev)) ||
      (next && !root.nextElementSibling?.matches(next))) {
    console.warn('[hrx-transition] not placed between', prev, 'and', next, '- left static.');
    return;
  }

  const stage = root.querySelector('.hrx-transition__stage');
  const white = root.querySelector('.hrx-transition__white');
  const title = root.querySelector('.hrx-transition__title');
  const lines = [...title.querySelectorAll('.hrx-line')];
  const join = root.querySelector('.hrx-transition__join');
  let fromScale = 0.3;
  let chars = [], tl = null, live = false, lastW = 0, timer = 0;

  // Split each line into characters (kept as plain text until libraries are ready).
  function split() {
    lines.forEach((line) => {
      const text = line.textContent; line.textContent = '';
      line.setAttribute('aria-hidden', 'true');
      [...text].forEach((c) => {
        const s = document.createElement('span');
        if (c === ' ') s.className = 'hrx-sp'; else { s.className = 'hrx-ch'; s.textContent = c; chars.push(s); }
        line.appendChild(s);
      });
    });
    const sr = document.createElement('span');
    sr.className = 'sr-only'; sr.textContent = 'HRX Gold Fitness';
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
    title.prepend(sr);
  }

  // Size the type so the widest line fills ~88% of the screen width (no overflow, any font).
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w) return;
    title.style.setProperty('--hrx-fs', '100px');
    const widest = Math.max(...lines.map((l) => l.scrollWidth)) || 1;
    let fs = 100 * Math.min(w * 0.88, 1500) / widest;
    fs = Math.min(fs, h * 0.3);
    title.style.setProperty('--hrx-fs', fs.toFixed(1) + 'px');
    if (join) {                          // JOIN must sit comfortably inside the small starting panel
      join.style.setProperty('--hrx-join-fs', '100px');
      const jw = join.firstChild ? (() => { const r = document.createRange(); r.selectNodeContents(join); return r.getBoundingClientRect().width; })() : 1;
      const panelW = w * fromScale, panelH = h * fromScale;
      const js = Math.min(100 * panelW * 0.72 / (jw || 1), panelH * 0.4);
      join.style.setProperty('--hrx-join-fs', js.toFixed(1) + 'px');
    }
  }

  function load(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  function build() {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true }); // phone address bar must not re-trigger layout
    const dir = root.dataset.direction === 'bottom' ? 'bottom' : 'center';
    const from = Math.min(0.9, Math.max(0.1, parseFloat(root.dataset.fromScale) || 0.3));
    fromScale = from;

    root.classList.add('is-live');
    split();
    fit();

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3, invalidateOnRefresh: true }
    });
    if (dir === 'bottom') {
      tl.fromTo(white, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, ease: 'power2.inOut', duration: 0.4 }, 0);
    } else {
      tl.fromTo(white, { scale: from, transformOrigin: '50% 50%' }, { scale: 1, ease: 'power2.inOut', duration: 0.4 }, 0);
    }
    if (join && dir === 'center') tl.fromTo(join, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -18, ease: 'power1.in', duration: 0.17 }, 0.03);
    tl.fromTo(chars, { yPercent: 112 }, { yPercent: 0, ease: 'power3.out', duration: 0.2, stagger: 0.014 }, 0.3);
    tl.to({}, { duration: Math.max(0.001, 1 - tl.duration()) }); // readable hold, then natural release
    live = true;

    window.addEventListener('resize', onResize, { passive: true });
    if (document.fonts) document.fonts.ready.then(() => { fit(); window.ScrollTrigger.refresh(); });
  }

  function onResize() {
    clearTimeout(timer);
    timer = setTimeout(() => {          // width only: ignore phone address-bar height changes
      if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; fit(); }
    }, 150);
  }

  function destroy() {
    if (!live) return;
    clearTimeout(timer);
    window.removeEventListener('resize', onResize);
    tl && tl.scrollTrigger && tl.scrollTrigger.kill();
    tl && tl.kill();
    window.gsap && window.gsap.set([white, join, ...chars].filter(Boolean), { clearProps: 'all' });
    root.classList.remove('is-live');
    live = false;
  }
  window.HrxTransition = { destroy };
  window.addEventListener('pagehide', destroy);

  function start() {
    if (reduce.matches) return;           // static, readable band (CSS)
    lastW = stage.clientWidth;
    Promise.resolve(window.gsap && window.ScrollTrigger ? 0 : load('vendor/gsap.min.js').then(() => load('vendor/ScrollTrigger.min.js')))
      .then(build)
      .catch(() => { /* libraries failed: the static band stays, nothing breaks */ });
  }
  // Wait until the page is fully loaded and the browser is idle, so loading speed is unaffected.
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  if (document.readyState === 'complete') idle(start, { timeout: 2500 });
  else window.addEventListener('load', () => idle(start, { timeout: 2500 }), { once: true });
})();

(() => {
  const topbar = document.querySelector('.topbar');
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const setScrolled = () => topbar?.classList.toggle('scrolled', window.scrollY > 8);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05,0.25,0.5] });
    sections.forEach(s => observer.observe(s));
  }

  const dialog = document.querySelector('#partnerDialog');
  const decorateDialog = () => {
    const body = dialog?.querySelector('.dialog-body');
    if (!body || body.querySelector('.dialog-trust-row')) return;
    const eyebrow = body.querySelector('.eyebrow');
    if (!eyebrow) return;
    const row = document.createElement('div');
    row.className = 'dialog-trust-row';
    row.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 2px';
    row.innerHTML = '<span class="hyp-chip">Outside-in hypothesis</span><span class="fact-chip">Official source linked below</span>';
    eyebrow.insertAdjacentElement('afterend', row);
  };

  document.querySelector('#partnerList')?.addEventListener('click', () => setTimeout(decorateDialog, 0));
  document.querySelector('#partnerList')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') setTimeout(decorateDialog, 0);
  });

  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.rel = 'noopener noreferrer';
  });

  const sourceHeading = document.querySelector('.sources .section-heading');
  if (sourceHeading && !sourceHeading.querySelector('.source-note')) {
    const note = document.createElement('p');
    note.className = 'source-note fineprint';
    note.textContent = 'Last public-source review for this application case: 13 Sep 2026.';
    sourceHeading.appendChild(note);
  }
})();

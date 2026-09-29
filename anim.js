// ===== Animations au défilement, compteurs, barre de progression =====
(() => {
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barre de progression de lecture en haut de page
  const barre = document.createElement('div');
  barre.className = 'progression';
  document.body.appendChild(barre);
  const majBarre = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    barre.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener('scroll', majBarre, { passive: true });
  majBarre();

  // Compteurs animés
  const formater = (el, v) => {
    const f = el.dataset.format;
    if (f === 'duree') { const h = Math.floor(v / 60), m = Math.round(v % 60); return `${h} h ${String(m).padStart(2, '0')}`; }
    return (el.dataset.prefix || '') + Math.round(v).toLocaleString('fr-FR') + (el.dataset.suffix || '');
  };
  const compter = el => {
    const fin = +el.dataset.to;
    if (reduit) { el.textContent = formater(el, fin); return; }
    const duree = 1600, debut = performance.now();
    const pas = t => {
      const p = Math.min((t - debut) / duree, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = formater(el, fin * e);
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  };
  document.querySelectorAll('[data-to]').forEach(el => el.textContent = formater(el, reduit ? +el.dataset.to : 0));

  // Apparition des éléments au défilement
  const cibles = document.querySelectorAll(
    'main section:not(.hero) h2, main section:not(.hero) .intro, .produit, .benefice, .position, .grille > div, blockquote, .chiffre, .comparatif, .specs, .autres a, .reponse'
  );
  if (!reduit) {
    document.documentElement.classList.add('anim');
    // décalage en cascade pour les éléments d'une même grille
    cibles.forEach(el => {
      const freres = [...el.parentElement.children].filter(c => c.matches(el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : '')));
      el.style.transitionDelay = (Math.max(0, freres.indexOf(el)) * 90) + 'ms';
    });
  }
  const obs = new IntersectionObserver(entrees => {
    entrees.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vu');
      e.target.querySelectorAll('[data-to]').forEach(compter);
      if (e.target.matches('[data-to]')) compter(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  cibles.forEach(el => obs.observe(el));
  document.querySelectorAll('[data-to]').forEach(el => { if (!el.closest('.chiffre, .grille > div')) obs.observe(el); });

  // Léger effet de profondeur sur l'image d'accueil
  const hero = document.querySelector('.hero-img');
  if (hero && !reduit) {
    addEventListener('scroll', () => {
      if (scrollY < innerHeight) hero.style.transform = `translateY(${scrollY * 0.08}px) scale(${1 + scrollY * 0.0001})`;
    }, { passive: true });
  }
})();

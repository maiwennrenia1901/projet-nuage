// ===== Inscription à la newsletter (Netlify Forms) =====
(() => {
  const form = document.querySelector('.news-form');
  if (!form) return;
  const msg = form.querySelector('.news-message');
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    msg.className = 'news-message';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Merci de saisir une adresse e-mail valide.'; msg.classList.add('erreur'); return; }
    if (!form.accord.checked) { msg.textContent = 'Cochez la case pour accepter de recevoir la newsletter.'; msg.classList.add('erreur'); return; }
    if (local) { msg.textContent = "Aperçu local : l'inscription fonctionnera une fois le site en ligne sur Netlify."; return; }
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!r.ok) throw new Error();
      form.reset();
      msg.textContent = 'Merci ! Votre inscription est confirmée.';
      msg.classList.add('ok');
    } catch {
      msg.textContent = "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.";
      msg.classList.add('erreur');
    }
  });
})();

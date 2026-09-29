// ===== Assistant Nuage : chatbot à réponses prédéfinies (fonctionne sans serveur) =====
(() => {
  const P = {
    classique: { nom: 'Le Classique', prix: 49, url: 'oreiller-memoire-de-forme-classique.html' },
    ergo: { nom: "L'Ergonomique", prix: 65, url: 'oreiller-ergonomique-cervical.html' },
    papillon: { nom: 'Le Papillon', prix: 72, url: 'oreiller-cervical-papillon.html' }
  };
  const carte = id => `<div class="cb-produit"><a href="${P[id].url}"><strong>${P[id].nom}</strong> · ${P[id].prix} €</a>
    <button class="cb-ajout" data-ajout="${id}">Ajouter au panier</button></div>`;

  const REPONSES = {
    accueil: { t: "Bonjour ! Je suis l'assistant Nuage. Je peux vous aider à choisir votre oreiller ou répondre à vos questions.", c: ['choisir', 'livraison', 'essai', 'entretien', 'hauteur', 'contact'] },
    choisir: { t: 'Dans quelle position dormez-vous le plus souvent ?', c: ['dos', 'cote', 'ventre', 'bouge'] },
    dos: { t: `Sur le dos, je vous recommande <strong>L'Ergonomique</strong> : sa vague soutient la courbe de la nuque.${carte('ergo')}`, c: ['hauteur', 'choisir'] },
    cote: { t: `Sur le côté, <strong>Le Papillon</strong> est idéal : ses découpes laissent de la place à l'épaule. L'Ergonomique en 12 cm fonctionne aussi très bien.${carte('papillon')}${carte('ergo')}`, c: ['epaule', 'choisir'] },
    ventre: { t: `Sur le ventre, prenez <strong>Le Classique</strong> : plus bas, il évite de trop relever la tête.${carte('classique')}`, c: ['choisir', 'livraison'] },
    bouge: { t: `Si vous changez souvent de position, <strong>Le Classique</strong> s'adapte à tout. Et si vous alternez surtout dos et côté, regardez <strong>Le Papillon</strong>.${carte('classique')}${carte('papillon')}`, c: ['choisir'] },
    epaule: { t: `Si vous vous réveillez l'épaule ou le bras engourdi, <strong>Le Papillon</strong> est fait pour vous : ses découpes latérales évitent de comprimer l'épaule.${carte('papillon')}`, c: ['choisir'] },
    hauteur: { t: "L'Ergonomique existe en 10 cm (dos, petit gabarit) et 12 cm (côté, épaules larges). En cas de doute, vous pouvez échanger pendant l'essai de 100 nuits.", c: ['dos', 'cote'] },
    livraison: { t: 'La livraison est <strong>offerte</strong> en France métropolitaine. Commande préparée sous 24 à 48 h, puis livrée en 3 à 5 jours ouvrés, avec suivi.', c: ['essai', 'paiement'] },
    essai: { t: "Vous avez <strong>100 nuits</strong> pour essayer. S'il ne vous convient pas, nous organisons le retour gratuitement et vous remboursons intégralement.", c: ['garantie', 'contact'] },
    garantie: { t: "Chaque oreiller est garanti <strong>3 ans</strong>. Si la mousse s'affaisse, nous le remplaçons.", c: ['essai'] },
    entretien: { t: "Retirez la housse grâce à la fermeture éclair et lavez-la à 40 °C. La mousse ne se lave pas : aérez-la régulièrement.", c: ['odeur'] },
    odeur: { t: "Une légère odeur au déballage est normale avec une mousse livrée sous vide. Laissez l'oreiller aérer 24 à 48 h sans sa housse.", c: ['entretien'] },
    paiement: { t: 'Paiement 100 % sécurisé par carte bancaire, Visa, Mastercard, Apple Pay ou Google Pay.', c: ['livraison'] },
    douleur: { t: "Un oreiller adapté aide à garder la nuque alignée pendant la nuit, mais il ne remplace pas un avis médical. Si vos douleurs persistent, consultez un professionnel de santé. Pour choisir le bon soutien, dites-moi comment vous dormez.", c: ['choisir'] },
    contact: { t: 'Vous pouvez nous écrire à <a href="mailto:contact@nuage-oreillers.fr">contact@nuage-oreillers.fr</a>. Nous répondons sous 24 h ouvrées.', c: ['choisir'] },
    inconnu: { t: "Je n'ai pas bien compris. Voici ce que je peux vous expliquer :", c: ['choisir', 'livraison', 'essai', 'entretien', 'contact'] }
  };
  const LIBELLES = { choisir: 'Quel oreiller choisir ?', livraison: 'Livraison', essai: 'Essai 100 nuits', entretien: 'Entretien', hauteur: 'Quelle hauteur ?', contact: 'Nous contacter',
    dos: 'Sur le dos', cote: 'Sur le côté', ventre: 'Sur le ventre', bouge: 'Je bouge beaucoup', epaule: "J'ai mal à l'épaule", garantie: 'Garantie', odeur: 'Odeur au déballage', paiement: 'Paiement' };
  const MOTS = [
    ['epaule', /épaule|epaule|bras|engourdi/], ['douleur', /douleur|mal |nuque|cervical|torticolis/], ['ventre', /ventre/],
    ['cote', /côté|cote|flanc/], ['dos', /\bdos\b/], ['bouge', /bouge|toutes positions/], ['hauteur', /hauteur|10 cm|12 cm|épais/],
    ['livraison', /livr|expédi|delai|délai|colis/], ['essai', /retour|rembours|essai|100 nuits|échang/], ['garantie', /garanti/],
    ['entretien', /lav|entretien|housse|nettoy/], ['odeur', /odeur|sent/], ['paiement', /pai|carte|apple pay|paypal/],
    ['choisir', /choisir|conseil|quel|lequel|recommand/], ['contact', /contact|humain|email|mail|téléphone|joindre/]
  ];

  document.body.insertAdjacentHTML('beforeend', `
    <button class="cb-bouton" id="cb-bouton" aria-expanded="false" aria-controls="cb-fenetre"><span aria-hidden="true">💬</span><span class="cb-label">Une question ?</span></button>
    <div class="cb-fenetre" id="cb-fenetre" role="dialog" aria-label="Assistant Nuage" hidden>
      <div class="cb-tete"><span><strong>Assistant Nuage</strong><small>Répond instantanément</small></span><button id="cb-fermer" aria-label="Fermer l'assistant">×</button></div>
      <div class="cb-messages" id="cb-messages" aria-live="polite"></div>
      <form class="cb-saisie" id="cb-saisie"><input id="cb-champ" type="text" placeholder="Écrivez votre question…" autocomplete="off" aria-label="Votre question"><button aria-label="Envoyer">➤</button></form>
    </div>`);
  const $ = id => document.getElementById(id);
  const msgs = $('cb-messages');

  const ajouter = (html, qui) => {
    const d = document.createElement('div');
    d.className = 'cb-msg ' + qui; d.innerHTML = html;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    return d;
  };
  const repondre = cle => {
    const r = REPONSES[cle] || REPONSES.inconnu;
    const typing = ajouter('<span class="cb-points"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(() => {
      typing.innerHTML = r.t;
      if (r.c) ajouter(r.c.map(c => `<button class="cb-choix" data-cle="${c}">${LIBELLES[c]}</button>`).join(''), 'choix');
      msgs.scrollTop = msgs.scrollHeight;
    }, 550);
  };
  const comprendre = texte => {
    const t = texte.toLowerCase();
    const m = MOTS.find(([, re]) => re.test(t));
    return m ? m[0] : 'inconnu';
  };

  let ouvert = false, demarre = false;
  const basculer = etat => {
    ouvert = etat ?? !ouvert;
    $('cb-fenetre').hidden = !ouvert;
    $('cb-bouton').setAttribute('aria-expanded', ouvert);
    $('cb-bouton').classList.toggle('actif', ouvert);
    if (ouvert && !demarre) { demarre = true; repondre('accueil'); }
    if (ouvert) setTimeout(() => $('cb-champ').focus(), 50);
  };
  $('cb-bouton').onclick = () => basculer();
  $('cb-fermer').onclick = () => { basculer(false); $('cb-bouton').focus(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ouvert) basculer(false); });

  msgs.addEventListener('click', e => {
    const b = e.target.closest('.cb-choix');
    if (!b) return;
    b.parentElement.remove();
    ajouter(b.textContent, 'moi');
    repondre(b.dataset.cle);
  });
  $('cb-saisie').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('cb-champ').value.trim();
    if (!v) return;
    msgs.querySelectorAll('.cb-msg.choix').forEach(n => n.remove());
    ajouter(v.replace(/</g, '&lt;'), 'moi');
    $('cb-champ').value = '';
    repondre(comprendre(v));
  });
})();

// ===== Produits : garde les mêmes prix que dans les pages HTML =====
const produits = {
  classique:{ nom:'Le Classique', prix:49, url:'oreiller-memoire-de-forme-classique.html' },
  ergo:{ nom:"L'Ergonomique", prix:65, url:'oreiller-ergonomique-cervical.html' },
  papillon:{ nom:'Le Papillon', prix:72, url:'oreiller-cervical-papillon.html' }
};
// Colle ici tes liens Stripe Payment Links
const liensPaiement = { classique:'', ergo:'', papillon:'' };

const recommandations = {
  dos:['ergo','oreiller-ergonomique-cervical.html',"L'Ergonomique soutient la courbe de votre nuque quand vous dormez sur le dos."],
  cote:['papillon','oreiller-cervical-papillon.html',"Le Papillon garde la tête alignée sur le flanc et laisse de la place à l'épaule."],
  ventre:['classique','oreiller-memoire-de-forme-classique.html',"Le Classique, plus bas, évite de trop relever la tête. Utilisez le bord le plus bas."],
  epaule:['papillon','oreiller-cervical-papillon.html',"Le Papillon et ses découpes latérales évitent d'écraser l'épaule pendant la nuit."]
};

const euro = n => n.toFixed(2).replace('.', ',') + ' €';
const $ = id => document.getElementById(id);
let panier = {};
try { panier = JSON.parse(localStorage.getItem('panier')) || {}; } catch(e) {}
const sauver = () => { try { localStorage.setItem('panier', JSON.stringify(panier)); } catch(e) {} };

// Une ligne de panier = produit + option éventuelle (ex. "ergo|12 cm")
function afficherPanier(){
  let total = 0, nb = 0;
  const cles = Object.keys(panier).filter(c => produits[c.split('|')[0]]);
  $('liste').innerHTML = cles.length ? cles.map(c => {
    const [id, opt] = c.split('|'), p = produits[id], q = panier[c];
    total += p.prix * q; nb += q;
    return `<li><a href="${p.url}" class="ligne-produit"><img src="images/${p.url.replace('.html','.webp')}" alt="" width="64" height="35"><span><strong>${p.nom}</strong>${opt ? ' · ' + opt : ''}<br>${euro(p.prix)}<span class="lien-fiche">Voir la fiche produit</span></span></a>
      <span class="qte"><button data-moins="${c}" aria-label="Retirer un ${p.nom}">−</button>${q}
      <button data-plus="${c}" aria-label="Ajouter un ${p.nom}">+</button></span></li>`;
  }).join('') : '<li class="vide">Votre panier est vide. Ajoutez un oreiller pour commencer.</li>';
  $('total').textContent = euro(total);
  $('compteur').textContent = nb;
  $('payer').disabled = !nb;
  $('payer').style.opacity = nb ? 1 : .5;
  sauver();
}

function ouvrir(){ $('panier').classList.add('ouvert'); $('voile').classList.add('visible'); $('panier').setAttribute('aria-hidden','false'); $('fermerPanier').focus(); }
function fermer(){ $('panier').classList.remove('ouvert'); $('voile').classList.remove('visible'); $('panier').setAttribute('aria-hidden','true'); $('ouvrirPanier').focus(); }

let minuterie;
function toast(msg){ const t = $('toast'); t.textContent = msg; t.classList.add('visible'); clearTimeout(minuterie); minuterie = setTimeout(() => t.classList.remove('visible'), 2200); }

document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.ajout){
    const choix = document.querySelector('input[name="hauteur"]:checked');
    const cle = t.dataset.ajout + (choix ? '|' + choix.value : '');
    panier[cle] = (panier[cle] || 0) + 1;
    afficherPanier(); toast(produits[t.dataset.ajout].nom + ' ajouté au panier');
    const c = $('compteur'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
  if (t.dataset.plus){ panier[t.dataset.plus]++; afficherPanier(); }
  if (t.dataset.moins){ if (--panier[t.dataset.moins] <= 0) delete panier[t.dataset.moins]; afficherPanier(); }
  if (t.dataset.position){
    document.querySelectorAll('[data-position]').forEach(b => b.setAttribute('aria-pressed', b === t));
    const [id, page, texte] = recommandations[t.dataset.position];
    $('reponse').innerHTML = `${texte} <a href="${page}">Voir ${produits[id].nom}</a>`;
  }
});
$('ouvrirPanier').onclick = ouvrir;
$('fermerPanier').onclick = fermer;
$('voile').onclick = fermer;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('panier').classList.contains('ouvert')) fermer(); });
$('payer').onclick = () => {
  const id = Object.keys(panier)[0].split('|')[0];
  if (liensPaiement[id]) window.location.href = liensPaiement[id];
  else alert('Paiement pas encore configuré : ajoute tes liens Stripe dans liensPaiement (panier.js).');
};

// Effet mémoire de forme (page d'accueil uniquement)
const o = $('oreiller');
if (o){
  const presser = () => o.classList.add('presse'), relacher = () => o.classList.remove('presse');
  o.addEventListener('pointerdown', presser);
  ['pointerup','pointerleave','pointercancel'].forEach(ev => o.addEventListener(ev, relacher));
  o.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); presser(); } });
  o.addEventListener('keyup', relacher);
}

afficherPanier();

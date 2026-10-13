// Texte repris mot pour mot du programme « Les 7 piliers du renouveau de la SCDV ».
const PILIERS = [
  ['Rassembler', 'L’unité de tous les artistes', 'Rassembler tous les artistes membres de la SCDV autour d’une vision commune, fondée sur la solidarité, le dialogue et la défense de leurs intérêts.'],
  ['Élargir', 'De nouvelles sources de collecte', 'Élargir l’assiette de collecte des droits, notamment en travaillant à la mise en œuvre effective de la rémunération pour copie privée, conformément au cadre juridique applicable.'],
  ['Garantir', 'La transparence et l’équité', 'Assurer une gestion transparente des fonds collectés et des répartitions justes, équitables et vérifiables au bénéfice des ayants droit.'],
  ['Protéger', 'La solidarité et l’action sociale', 'Faire fonctionner pleinement les organes de la société, notamment le Fonds d’aide sociale, afin d’accompagner les artistes en détresse et les familles endeuillées.'],
  ['Connecter', 'La coopération internationale', 'Conclure des conventions de réciprocité avec les sociétés de gestion des droits voisins à travers le monde pour favoriser la protection et la rémunération des artistes au-delà des frontières.'],
  ['Assurer', 'La couverture maladie des membres', 'Mettre en place un dispositif d’assurance maladie accessible aux membres de la SCDV, selon des modalités de financement et de couverture clairement définies.'],
  ['Moderniser', 'La digitalisation de la SCDV', 'Digitaliser les procédures et les services pour une gestion moderne, plus rapide, plus accessible et plus transparente.'],
];

const list = document.getElementById('setlist');
list.innerHTML = PILIERS.map(([verbe, theme, texte], i) => {
  const n = i + 1;
  return `
  <li class="row" style="--i:${i}">
    <details name="pilier" id="pilier-${n}">
      <summary>
        <span class="row__n">${String(n).padStart(2, '0')}</span>
        <span class="row__verb">${verbe}</span>
        <span class="row__theme">${theme}</span>
        <span class="row__toggle" aria-hidden="true"></span>
      </summary>
      <div class="row__body">
        <div class="row__reading">
          <p class="row__kicker">Pilier ${n} sur 7 · ${verbe}</p>
          <h3 class="row__title">${theme}</h3>
          <p class="row__text">${texte}</p>
        </div>
        <div class="row__media">
          <video controls playsinline preload="none" poster="assets/poster-${n}.jpg" data-src="videos/pilier-${n}.mp4"></video>
          <a class="row__dl" href="videos/pilier-${n}.mp4" download="SCDV2026-pilier-${n}-${verbe}.mp4">Télécharger cette vidéo</a>
        </div>
      </div>
    </details>
  </li>`;
}).join('');

// Les vidéos ne se chargent qu'à l'ouverture du pilier, et s'arrêtent à sa fermeture.
list.addEventListener('toggle', (e) => {
  const details = e.target;
  const video = details.querySelector('video');
  if (!video) return;
  if (details.open) {
    if (!video.src) video.src = video.dataset.src;
  } else {
    video.pause();
  }
}, true);

// Sur grand écran, la liste et la lecture sont côte à côte : un pilier reste toujours ouvert.
const wide = matchMedia('(min-width: 1024px)');
const ensureOneOpen = () => {
  if (wide.matches && !list.querySelector('details[open]')) {
    list.querySelector('details').open = true;
  }
};
list.addEventListener('click', (e) => {
  const summary = e.target.closest('summary');
  if (wide.matches && summary && summary.parentElement.open) e.preventDefault();
});
wide.addEventListener('change', ensureOneOpen);

// Ouvre le pilier ciblé par l'adresse (ex. …/#pilier-4).
const fromHash = () => {
  const target = location.hash && document.querySelector(`details${location.hash}`);
  if (target) target.open = true;
};
window.addEventListener('hashchange', fromHash);
fromHash();
ensureOneOpen();

// Partage
const url = location.href.split('#')[0];
const message = `Ruben Binam — SCDV 2026. Découvrez les 7 piliers du renouveau de la SCDV : ${url}`;
document.querySelectorAll('.js-share-wa').forEach((a) => {
  a.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
});
document.querySelectorAll('.js-share-fb').forEach((a) => {
  a.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
});
const status = document.querySelector('.share__status');
document.querySelector('.js-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Lien copié.';
  } catch {
    status.textContent = `Copiez ce lien : ${url}`;
  }
});

// Apparition des lignes de la setlist au défilement.
const rows = document.querySelectorAll('.row');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  rows.forEach((r) => io.observe(r));
}

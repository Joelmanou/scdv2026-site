// Écrit pour fonctionner aussi sur les vieux téléphones (Android 7, Chrome ancien) :
// pas d'async/await, pas de padStart, pas de catch sans paramètre.
(function () {
  // Hauteur réelle de l'écran (sans la barre d'adresse) pour que chaque section mobile tienne
  // dans un écran. Recalculée seulement si la largeur change (rotation), pas quand la barre
  // d'adresse apparaît ou disparaît au défilement, sinon la page sauterait.
  var lastW = 0;
  function setAppHeight() {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px');
  }
  setAppHeight();
  window.addEventListener('resize', setAppHeight);

  // Texte repris mot pour mot du programme « Les 7 piliers du renouveau de la SCDV ».
  var PILIERS = [
    ['Rassembler', 'L’unité de tous les artistes', 'Rassembler tous les artistes membres de la SCDV autour d’une vision commune, fondée sur la solidarité, le dialogue et la défense de leurs intérêts.'],
    ['Élargir', 'De nouvelles sources de collecte', 'Élargir l’assiette de collecte des droits, notamment en travaillant à la mise en œuvre effective de la rémunération pour copie privée, conformément au cadre juridique applicable.'],
    ['Garantir', 'La transparence et l’équité', 'Assurer une gestion transparente des fonds collectés et des répartitions justes, équitables et vérifiables au bénéfice des ayants droit.'],
    ['Protéger', 'La solidarité et l’action sociale', 'Faire fonctionner pleinement les organes de la société, notamment le Fonds d’aide sociale, afin d’accompagner les artistes en détresse et les familles endeuillées.'],
    ['Connecter', 'La coopération internationale', 'Conclure des conventions de réciprocité avec les sociétés de gestion des droits voisins à travers le monde pour favoriser la protection et la rémunération des artistes au-delà des frontières.'],
    ['Assurer', 'La couverture maladie des membres', 'Mettre en place un dispositif d’assurance maladie accessible aux membres de la SCDV, selon des modalités de financement et de couverture clairement définies.'],
    ['Moderniser', 'La digitalisation de la SCDV', 'Digitaliser les procédures et les services pour une gestion moderne, plus rapide, plus accessible et plus transparente.']
  ];

  // Version des médias : à augmenter quand les vidéos ou vignettes changent (cache CDN Hostinger).
  var V = '6';

  var list = document.getElementById('setlist');
  var html = '';
  for (var i = 0; i < PILIERS.length; i++) {
    var verbe = PILIERS[i][0], theme = PILIERS[i][1], texte = PILIERS[i][2];
    var n = i + 1;
    html +=
      '<li class="row" style="--i:' + i + '">' +
        '<details name="pilier" id="pilier-' + n + '">' +
          '<summary>' +
            '<span class="row__n">0' + n + '</span>' +
            '<span class="row__verb">' + verbe + '</span>' +
            '<span class="row__theme">' + theme + '</span>' +
            '<span class="row__toggle" aria-hidden="true"></span>' +
          '</summary>' +
          '<div class="row__body">' +
            '<button type="button" class="row__close" aria-label="Fermer le pilier">Fermer ✕</button>' +
            '<div class="row__reading">' +
              '<p class="row__kicker">Pilier ' + n + ' sur 7 · ' + verbe + '</p>' +
              '<h3 class="row__title">' + theme + '</h3>' +
              '<button type="button" class="row__more" aria-expanded="false">Lire le texte</button>' +
              '<p class="row__text">' + texte + '</p>' +
            '</div>' +
            '<div class="row__media">' +
              '<video controls playsinline preload="none" poster="assets/poster-' + n + '.jpg?v=' + V + '" data-src="videos/pilier-' + n + '.mp4?v=' + V + '"></video>' +
              '<div class="row__dl">' +
                '<button type="button" class="row__fs">Plein écran</button>' +
                '<a href="videos/pilier-' + n + '.mp4?v=' + V + '" download="SCDV2026-pilier-' + n + '-' + verbe + '.mp4">Télécharger cette vidéo</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</details>' +
      '</li>';
  }
  list.innerHTML = html;

  var allDetails = list.querySelectorAll('details');
  var wide = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: false };
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 860px)') : { matches: true };

  // Fiche mobile : la vidéo prend toute la place libre, à ses vraies proportions (9:16),
  // sans bandes noires. Calculé en JS pour fonctionner aussi sur les vieux navigateurs.
  function fitVideo(details) {
    var video = details.querySelector('video');
    var media = details.querySelector('.row__media');
    var dl = details.querySelector('.row__dl');
    video.style.width = '';
    video.style.height = '';
    video.style.flex = '';
    if (!narrow.matches || !details.open) return;
    var availH = media.clientHeight - dl.offsetHeight - 10;
    var availW = media.clientWidth;
    var w = Math.max(120, Math.min(availW, availH * 9 / 16));
    video.style.flex = 'none';
    video.style.width = Math.floor(w) + 'px';
    video.style.height = Math.floor(w * 16 / 9) + 'px';
  }
  function fitOpen() {
    var open = list.querySelector('details[open]');
    if (open) fitVideo(open);
  }
  window.addEventListener('resize', fitOpen);

  // Les vidéos ne se chargent qu'à l'ouverture du pilier, et s'arrêtent à sa fermeture.
  var root = document.documentElement;
  function onToggle(details) {
    var video = details.querySelector('video');
    if (!video) return;
    // Sur mobile, un pilier ouvert s'affiche en plein écran : on bloque le défilement derrière.
    root.className = root.className.replace(/\s*pilier-open/g, '');
    if (list.querySelector('details[open]')) root.className += ' pilier-open';
    if (details.open) {
      if (!video.getAttribute('src')) video.setAttribute('src', video.getAttribute('data-src'));
      // Un seul pilier ouvert à la fois (l'attribut name n'est pas compris partout).
      for (var k = 0; k < allDetails.length; k++) {
        if (allDetails[k] !== details && allDetails[k].open) allDetails[k].open = false;
      }
      setTimeout(function () { fitVideo(details); }, 0);
    } else {
      video.pause();
    }
  }
  list.addEventListener('toggle', function (e) { onToggle(e.target); }, true);

  // Sur grand écran, la liste et la lecture sont côte à côte : un pilier reste toujours ouvert.
  function ensureOneOpen() {
    if (wide.matches && !list.querySelector('details[open]')) allDetails[0].open = true;
  }
  list.addEventListener('click', function (e) {
    if (e.target.className === 'row__fs') {
      var v = e.target.parentNode.parentNode.querySelector('video');
      if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
      enterFullscreen(v);
      var pp = v.play();
      if (pp && pp.then) pp.then(null, function () {});
      return;
    }
    if (e.target.className === 'row__more') {
      // Affiche ou masque le texte écrit ; la vidéo se redimensionne en conséquence.
      var body = e.target.parentNode.parentNode;
      var showing = / is-text/.test(body.className);
      body.className = showing ? body.className.replace(/ is-text/g, '') : body.className + ' is-text';
      e.target.textContent = showing ? 'Lire le texte' : 'Masquer le texte';
      e.target.setAttribute('aria-expanded', showing ? 'false' : 'true');
      fitVideo(body.parentNode);
      return;
    }
    if (e.target.className === 'row__close') {
      var d = e.target.parentNode.parentNode;
      d.open = false;
      onToggle(d);
      // Ramène la liste des piliers à l'écran après fermeture.
      var section = document.getElementById('piliers');
      if (section.scrollIntoView) section.scrollIntoView();
      return;
    }
    var el = e.target;
    while (el && el !== list && el.tagName !== 'SUMMARY') el = el.parentNode;
    if (wide.matches && el && el.tagName === 'SUMMARY' && el.parentNode.open) e.preventDefault();
  });
  if (wide.addEventListener) wide.addEventListener('change', ensureOneOpen);
  else if (wide.addListener) wide.addListener(ensureOneOpen);

  // Ouvre le pilier ciblé par l'adresse (ex. …/#pilier-4).
  function fromHash() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.tagName === 'DETAILS') target.open = true;
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
  ensureOneOpen();

  // Plein écran : bouton dédié sous la vidéo complète, et passage automatique en plein écran
  // quand on lance une vidéo sur téléphone (Chrome y cache le bouton plein écran dans le menu ⋮).
  function isFullscreen() {
    return document.fullscreenElement || document.webkitFullscreenElement;
  }
  function enterFullscreen(video) {
    var request = video.requestFullscreen || video.webkitRequestFullscreen || video.webkitEnterFullscreen;
    if (!request) return;
    try {
      var p = request.call(video);
      if (p && p.then) p.then(null, function () {});
    } catch (err) { /* refusé par le navigateur : la vidéo continue dans la page */ }
  }
  document.addEventListener('play', function (e) {
    if (narrow.matches && e.target.tagName === 'VIDEO' && !isFullscreen()) enterFullscreen(e.target);
  }, true);
  var fsButton = document.querySelector('.js-fullscreen');
  if (fsButton) {
    fsButton.addEventListener('click', function () {
      var video = document.querySelector('.film__player video');
      enterFullscreen(video);
      var p = video.play();
      if (p && p.then) p.then(null, function () {});
    });
  }

  // Partage
  var url = location.href.split('#')[0];
  var message = 'Ruben Binam — SCDV 2026. Découvrez les 7 piliers du renouveau de la SCDV : ' + url;
  var wa = document.querySelectorAll('.js-share-wa');
  for (var w = 0; w < wa.length; w++) wa[w].href = 'https://wa.me/?text=' + encodeURIComponent(message);
  var fb = document.querySelectorAll('.js-share-fb');
  for (var f = 0; f < fb.length; f++) fb[f].href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);

  var status = document.querySelector('.share__status');
  document.querySelector('.js-copy').addEventListener('click', function () {
    var shown = function () { status.textContent = 'Lien copié.'; };
    var manual = function () { status.textContent = 'Copiez ce lien : ' + url; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(shown, manual);
    } else {
      manual();
    }
  });

  // Apparition des lignes de la setlist au défilement (navigateurs récents uniquement).
  var rows = list.querySelectorAll('.row');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    document.documentElement.className += ' js-reveal';
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.className += ' is-in';
          io.unobserve(entries[j].target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    for (var r = 0; r < rows.length; r++) io.observe(rows[r]);
  }
})();

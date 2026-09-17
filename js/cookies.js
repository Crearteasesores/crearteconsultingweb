(function () {
  var KEY = "crearte_cookie_consent";
  var stored;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {
    stored = null;
  }
  if (stored) return;

  var lang = (document.documentElement.lang || "es").slice(0, 2);
  var text = {
    es: {
      msg: 'Usamos cookies técnicas necesarias para el funcionamiento de la web. Si reproduces alguno de nuestros vídeos, YouTube puede establecer sus propias cookies. Más información en nuestra <a href="/politica-cookies/">Política de Cookies</a>.',
      reject: "Rechazar no esenciales",
      accept: "Aceptar"
    },
    en: {
      msg: 'We use technical cookies necessary for the website to function. If you play one of our videos, YouTube may set its own cookies. More information in our <a href="/politica-cookies/">Cookie Policy</a>.',
      reject: "Reject non-essential",
      accept: "Accept"
    },
    fr: {
      msg: 'Nous utilisons des cookies techniques nécessaires au fonctionnement du site. Si vous lancez une de nos vidéos, YouTube peut déposer ses propres cookies. Plus d\'informations dans notre <a href="/politica-cookies/">Politique de Cookies</a>.',
      reject: "Refuser les non essentiels",
      accept: "Accepter"
    }
  };
  var t = text[lang] || text.es;

  var banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie notice");
  banner.innerHTML =
    "<p>" + t.msg + "</p>" +
    '<div class="cookie-banner-actions">' +
    '<button type="button" class="reject">' + t.reject + "</button>" +
    '<button type="button" class="accept">' + t.accept + "</button>" +
    "</div>";
  document.body.appendChild(banner);

  function dismiss(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {}
    banner.remove();
  }
  banner.querySelector(".accept").addEventListener("click", function () {
    dismiss("accepted");
  });
  banner.querySelector(".reject").addEventListener("click", function () {
    dismiss("rejected");
  });
})();

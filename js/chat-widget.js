(function () {
  var lang = (document.documentElement.lang || "es").slice(0, 2);

  var STRINGS = {
    es: {
      title: "Crearte Consulting",
      subtitle: "Asistente virtual",
      placeholder: "Escribe tu pregunta…",
      send: "Enviar",
      greeting: "Hola, soy el asistente de Crearte Consulting. ¿Buscas empleo, quieres cubrir una vacante, o tienes una pregunta sobre nuestros servicios?",
      thinking: "Escribiendo…",
      error: "Algo ha ido mal. Escríbenos directamente a info@crearteconsulting.com.",
    },
    en: {
      title: "Crearte Consulting",
      subtitle: "Virtual assistant",
      placeholder: "Type your question…",
      send: "Send",
      greeting: "Hi, I'm Crearte Consulting's assistant. Are you looking for a job, need to fill a vacancy, or have a question about our services?",
      thinking: "Typing…",
      error: "Something went wrong. Please email us directly at info@crearteconsulting.com.",
    },
    fr: {
      title: "Crearte Consulting",
      subtitle: "Assistant virtuel",
      placeholder: "Écrivez votre question…",
      send: "Envoyer",
      greeting: "Bonjour, je suis l'assistant de Crearte Consulting. Cherchez-vous un emploi, un poste à pourvoir, ou avez-vous une question sur nos services ?",
      thinking: "En train d'écrire…",
      error: "Une erreur est survenue. Écrivez-nous directement à info@crearteconsulting.com.",
    },
  };
  var t = STRINGS[lang] || STRINGS.es;

  var history = []; // {role, content}

  var btn = document.createElement("button");
  btn.className = "cc-chat-btn";
  btn.setAttribute("aria-label", t.subtitle);
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 4h16v12H7l-3 3V4z"/></svg>';

  var panel = document.createElement("div");
  panel.className = "cc-chat-panel";
  panel.hidden = true;
  panel.innerHTML =
    '<div class="cc-chat-head">' +
    "<div><strong>" + t.title + "</strong><span>" + t.subtitle + "</span></div>" +
    '<button type="button" class="cc-chat-close" aria-label="Close">\u00D7</button>' +
    "</div>" +
    '<div class="cc-chat-body" id="cc-chat-body"></div>' +
    '<form class="cc-chat-form" id="cc-chat-form">' +
    '<input type="text" id="cc-chat-input" placeholder="' + t.placeholder + '" autocomplete="off" maxlength="500">' +
    '<button type="submit">' + t.send + "</button>" +
    "</form>";

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var body = panel.querySelector("#cc-chat-body");
  var form = panel.querySelector("#cc-chat-form");
  var input = panel.querySelector("#cc-chat-input");
  var closeBtn = panel.querySelector(".cc-chat-close");

  function addMessage(role, text, opts) {
    opts = opts || {};
    var div = document.createElement("div");
    div.className = "cc-msg " + role + (opts.pending ? " pending" : "");
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  var greeted = false;
  function openPanel() {
    panel.hidden = false;
    if (!greeted) {
      addMessage("assistant", t.greeting);
      greeted = true;
    }
    input.focus();
  }

  btn.addEventListener("click", function () {
    if (panel.hidden) { openPanel(); } else { panel.hidden = true; }
  });
  closeBtn.addEventListener("click", function () { panel.hidden = true; });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage("user", text);
    history.push({ role: "user", content: text });

    var pending = addMessage("assistant", t.thinking, { pending: true });
    var sendBtn = form.querySelector("button[type=submit]");
    sendBtn.disabled = true;

    fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        pending.remove();
        sendBtn.disabled = false;
        if (data && data.reply) {
          addMessage("assistant", data.reply);
          history.push({ role: "assistant", content: data.reply });
        } else {
          addMessage("assistant", t.error);
        }
      })
      .catch(function () {
        pending.remove();
        sendBtn.disabled = false;
        addMessage("assistant", t.error);
      });
  });
})();

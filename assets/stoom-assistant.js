(function () {
  "use strict";

  const endpoint = "https://stoom-assistant-api.a-blanc63100.workers.dev/chat";
  const maxQuestionsPerWindow = 5;
  const usageWindowMs = 15 * 60 * 1000;
  const usageStorageKey = "stoomAssistantUsageV1";
  const maxHistoryMessages = 8;

  const currentScript = document.currentScript;
  const avatarUrl = new URL(
    "../uploads/camille-assistant.webp",
    currentScript ? currentScript.src : window.location.href
  ).href;

  function boot() {
    // Sur index.html, Camille existe déjà : aucun doublon.
    if (document.getElementById("stoomAssistant")) return;

    injectStyles();
    injectMarkup();
    initAssistant();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  function injectStyles() {
    if (document.getElementById("stoom-assistant-style")) return;

    const style = document.createElement("style");
    style.id = "stoom-assistant-style";

    style.textContent = `
      .stoom-assistant,
      .stoom-assistant *{
        box-sizing:border-box;
      }

      .stoom-assistant{
        position:fixed;
        right:26px;
        bottom:18px;
        z-index:9990;
        font-family:Montserrat,Arial,sans-serif;
      }

      .stoom-chat-launcher{
        position:relative;
        width:112px;
        height:122px;
        min-height:122px;
        display:grid;
        place-items:end center;
        padding:0;
        border:0;
        background:transparent;
        cursor:pointer;
        overflow:visible;
        transition:transform .2s ease;
      }

      .stoom-chat-launcher:hover,
      .stoom-chat-launcher:focus-visible{
        transform:translateY(-4px) scale(1.02);
        outline:none;
      }

      .camille-avatar-frame{
        position:relative;
        width:96px;
        height:112px;
        display:grid;
        place-items:end center;
        overflow:visible;
      }

      .camille-avatar{
        display:block;
        width:122px;
        height:132px;
        max-width:none;
        object-fit:contain;
        object-position:center bottom;
        transform:translateY(-3px);
        filter:
          drop-shadow(0 0 1px rgba(239,253,255,.95))
          drop-shadow(0 0 5px rgba(85,212,255,.92))
          drop-shadow(0 0 14px rgba(85,212,255,.40));
        pointer-events:none;
        user-select:none;
      }

      .stoom-chat-launcher::after{
        content:"";
        position:absolute;
        top:10px;
        right:7px;
        width:12px;
        height:12px;
        border:2px solid #06131d;
        border-radius:50%;
        background:#6dffb7;
        box-shadow:0 0 12px rgba(109,255,183,.6);
      }

      .stoom-chat-panel{
        position:absolute;
        right:0;
        bottom:128px;
        width:min(390px,calc(100vw - 32px));
        display:none;
        flex-direction:column;
        overflow:hidden;
        border:1px solid rgba(142,234,255,.34);
        border-radius:22px;
        background:
          radial-gradient(circle at top right,rgba(85,212,255,.16),transparent 32%),
          linear-gradient(145deg,#0a2432,#04131c);
        box-shadow:0 28px 76px rgba(0,0,0,.48);
        color:#edfaff;
      }

      .stoom-chat-panel.is-open{
        display:flex;
        animation:stoomChatIn .22s ease both;
      }

      @keyframes stoomChatIn{
        from{
          opacity:0;
          transform:translateY(12px) scale(.98);
        }
        to{
          opacity:1;
          transform:translateY(0) scale(1);
        }
      }

      .stoom-chat-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:15px 16px;
        border-bottom:1px solid rgba(142,234,255,.18);
        background:rgba(3,16,24,.42);
      }

      .stoom-chat-heading{
        display:flex;
        align-items:center;
        gap:11px;
        min-width:0;
      }

      .stoom-chat-heading .camille-avatar-frame{
        width:45px;
        height:48px;
        flex:0 0 45px;
      }

      .stoom-chat-heading .camille-avatar{
        width:60px;
        height:66px;
        transform:translateY(-6px);
      }

      .stoom-chat-heading small{
        display:block;
        margin-bottom:3px;
        color:#8eeaff;
        font-size:.58rem;
        font-weight:900;
        letter-spacing:.05em;
        text-transform:uppercase;
      }

      .stoom-chat-heading strong{
        display:block;
        color:#fff;
        font-size:.84rem;
        line-height:1.2;
      }

      .stoom-chat-close{
        width:34px;
        height:34px;
        display:grid;
        place-items:center;
        flex:0 0 34px;
        padding:0;
        border:1px solid rgba(255,255,255,.16);
        border-radius:11px;
        background:rgba(255,255,255,.06);
        color:#fff;
        font-size:1.35rem;
        line-height:1;
        cursor:pointer;
      }

      .stoom-chat-close:hover,
      .stoom-chat-close:focus-visible{
        border-color:#8eeaff;
        background:rgba(142,234,255,.12);
        outline:none;
      }

      .stoom-chat-body{
        max-height:min(355px,calc(100dvh - 260px));
        padding:14px;
        overflow-y:auto;
        overscroll-behavior:contain;
      }

      .stoom-chat-messages{
        display:grid;
        gap:10px;
      }

      .stoom-chat-message{
        max-width:92%;
        padding:10px 11px;
        border-radius:14px;
      }

      .stoom-chat-message.assistant{
        justify-self:start;
        border:1px solid rgba(142,234,255,.16);
        background:rgba(142,234,255,.08);
      }

      .stoom-chat-message.user{
        justify-self:end;
        background:linear-gradient(135deg,#55d4ff,#8eeaff);
        color:#06131d;
      }

      .stoom-chat-message-label{
        display:block;
        margin-bottom:4px;
        color:#8eeaff;
        font-size:.55rem;
        font-weight:950;
        letter-spacing:.06em;
        text-transform:uppercase;
      }

      .stoom-chat-message.user .stoom-chat-message-label{
        color:#06131d;
      }

      .stoom-chat-message-text{
        margin:0;
        color:#edfaff;
        font-size:.77rem;
        font-weight:600;
        line-height:1.5;
        white-space:pre-wrap;
      }

      .stoom-chat-message.user .stoom-chat-message-text{
        color:#06131d;
      }

      .stoom-chat-product-link{
        color:#8eeaff;
        font-weight:900;
        text-decoration:underline;
        text-decoration-thickness:1px;
        text-underline-offset:3px;
      }

      .stoom-chat-product-link:hover,
      .stoom-chat-product-link:focus-visible{
        color:#fff;
        text-decoration-thickness:2px;
        outline:none;
      }

      .stoom-chat-quick{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin-top:13px;
      }

      .stoom-chat-quick button{
        min-height:32px;
        padding:7px 9px;
        border:1px solid rgba(142,234,255,.24);
        border-radius:10px;
        background:rgba(255,255,255,.05);
        color:#dff7ff;
        font:inherit;
        font-size:.62rem;
        font-weight:800;
        line-height:1.2;
        cursor:pointer;
      }

      .stoom-chat-quick button:hover,
      .stoom-chat-quick button:focus-visible{
        border-color:#8eeaff;
        background:rgba(142,234,255,.12);
        outline:none;
      }

      .stoom-chat-footer{
        padding:12px;
        border-top:1px solid rgba(142,234,255,.16);
        background:rgba(2,12,18,.32);
      }

      .stoom-chat-form{
        display:flex;
        align-items:flex-end;
        gap:8px;
      }

      .stoom-chat-input{
        width:100%;
        min-height:44px;
        max-height:105px;
        resize:none;
        padding:11px 12px;
        border:1px solid rgba(142,234,255,.25);
        border-radius:13px;
        background:rgba(255,255,255,.06);
        color:#fff;
        font:inherit;
        font-size:.75rem;
        line-height:1.35;
      }

      .stoom-chat-input::placeholder{
        color:#a8c3cf;
      }

      .stoom-chat-input:focus{
        border-color:#8eeaff;
        outline:none;
        box-shadow:0 0 0 3px rgba(142,234,255,.10);
      }

      .stoom-chat-send{
        min-height:44px;
        padding:0 12px;
        border:0;
        border-radius:13px;
        background:linear-gradient(135deg,#55d4ff,#8eeaff);
        color:#06131d;
        font:inherit;
        font-size:.67rem;
        font-weight:950;
        cursor:pointer;
      }

      .stoom-chat-send:disabled{
        opacity:.58;
        cursor:wait;
      }

      .stoom-chat-privacy{
        margin:8px 2px 0;
        color:#9db9c5;
        font-size:.55rem;
        font-weight:650;
        line-height:1.4;
      }

      .stoom-chat-typing{
        display:flex;
        align-items:center;
        gap:5px;
        min-height:18px;
      }

      .stoom-chat-typing span{
        width:6px;
        height:6px;
        border-radius:50%;
        background:#8eeaff;
        animation:stoomTyping 1s infinite ease-in-out;
      }

      .stoom-chat-typing span:nth-child(2){
        animation-delay:.14s;
      }

      .stoom-chat-typing span:nth-child(3){
        animation-delay:.28s;
      }

      @keyframes stoomTyping{
        0%,100%{
          opacity:.35;
          transform:translateY(0);
        }
        50%{
          opacity:1;
          transform:translateY(-4px);
        }
      }

      .stoom-assistant .sr-only{
        position:absolute;
        width:1px;
        height:1px;
        padding:0;
        margin:-1px;
        overflow:hidden;
        clip:rect(0,0,0,0);
        white-space:nowrap;
        border:0;
      }

      @media(max-width:760px){
        .stoom-assistant{
          right:14px;
          bottom:92px;
        }

        .stoom-chat-launcher{
          width:76px;
          height:86px;
          min-height:86px;
        }

        .camille-avatar-frame{
          width:70px;
          height:82px;
        }

        .camille-avatar{
          width:88px;
          height:96px;
        }

        .stoom-chat-launcher::after{
          top:3px;
          right:0;
        }

        .stoom-chat-panel{
          position:fixed;
          right:10px;
          bottom:86px;
          width:calc(100vw - 20px);
          max-height:calc(100dvh - 106px);
          border-radius:20px;
        }

        .stoom-chat-body{
          max-height:min(330px,calc(100dvh - 245px));
        }
      }
    `;

    document.head.appendChild(style);
  }

  function injectMarkup() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <aside class="stoom-assistant" id="stoomAssistant" aria-label="Camille, assistant virtuel STOOM">
          <button
            class="stoom-chat-launcher"
            id="stoomChatLauncher"
            type="button"
            aria-controls="stoomChatPanel"
            aria-expanded="false"
            aria-label="Ouvrir Camille, conseil STOOM"
          >
            <span class="camille-avatar-frame" aria-hidden="true">
              <img class="camille-avatar" src="${avatarUrl}" alt="" width="656" height="820" decoding="async">
            </span>
          </button>

          <section
            class="stoom-chat-panel"
            id="stoomChatPanel"
            role="dialog"
            aria-label="Conversation avec Camille, assistant virtuel STOOM"
            aria-hidden="true"
          >
            <header class="stoom-chat-header">
              <div class="stoom-chat-heading">
                <span class="camille-avatar-frame" aria-hidden="true">
                  <img class="camille-avatar" src="${avatarUrl}" alt="" width="656" height="820" decoding="async">
                </span>

                <div>
                  <small>Camille · assistant virtuel STOOM</small>
                  <strong>Conseil matériel, DIY et SAV</strong>
                </div>
              </div>

              <button class="stoom-chat-close" id="stoomChatClose" type="button" aria-label="Fermer Camille">×</button>
            </header>

            <div class="stoom-chat-body" id="stoomChatBody">
              <div class="stoom-chat-messages" id="stoomChatMessages" aria-live="polite" aria-relevant="additions text"></div>

              <div class="stoom-chat-quick" id="stoomChatQuick">
                <button type="button" data-prompt="Je dois changer ma résistance. Comment savoir laquelle prendre ?">Changer ma résistance</button>
                <button type="button" data-prompt="Je cherche un matériel simple pour arrêter la cigarette.">Trouver mon matériel</button>
                <button type="button" data-prompt="Peux-tu m’aider pour un calcul DIY ?">Conseil DIY</button>
                <button type="button" data-prompt="Mon matériel fuit. Que puis-je vérifier ?">Mon matériel fuit</button>
              </div>
            </div>

            <footer class="stoom-chat-footer">
              <form class="stoom-chat-form" id="stoomChatForm">
                <label class="sr-only" for="stoomChatInput">Votre question pour Camille</label>

                <textarea
                  class="stoom-chat-input"
                  id="stoomChatInput"
                  rows="1"
                  maxlength="1200"
                  placeholder="Décris ton matériel ou ta question…"
                ></textarea>

                <button class="stoom-chat-send" id="stoomChatSend" type="submit">Envoyer</button>
              </form>

              <p class="stoom-chat-privacy">
                Camille est un guide virtuel. N’envoyez pas de coordonnées, données de santé ou informations bancaires.
              </p>
            </footer>
          </section>
        </aside>
      `
    );
  }

  function initAssistant() {
    const launcher = document.getElementById("stoomChatLauncher");
    const panel = document.getElementById("stoomChatPanel");
    const closeButton = document.getElementById("stoomChatClose");
    const form = document.getElementById("stoomChatForm");
    const input = document.getElementById("stoomChatInput");
    const sendButton = document.getElementById("stoomChatSend");
    const messages = document.getElementById("stoomChatMessages");
    const quickPrompts = document.getElementById("stoomChatQuick");
    const chatBody = document.getElementById("stoomChatBody");

    if (!launcher || !panel || !closeButton || !form || !input || !sendButton || !messages || !quickPrompts || !chatBody) {
      return;
    }

    let history = [];
    let greeted = false;
    let pending = false;

    function track(eventName, parameters) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        assistant_surface: window.location.pathname || "site",
        ...(parameters || {})
      });
    }

    function getUsage() {
      try {
        const saved = JSON.parse(sessionStorage.getItem(usageStorageKey) || "{}");
        const now = Date.now();

        if (!saved.startedAt || now - saved.startedAt > usageWindowMs) {
          return { startedAt: now, count: 0 };
        }

        return {
          startedAt: saved.startedAt,
          count: Number(saved.count || 0)
        };
      } catch (error) {
        return { startedAt: Date.now(), count: 0 };
      }
    }

    function saveUsage(usage) {
      try {
        sessionStorage.setItem(usageStorageKey, JSON.stringify(usage));
      } catch (error) {}
    }

    function canAskQuestion() {
      return getUsage().count < maxQuestionsPerWindow;
    }

    function incrementUsage() {
      const usage = getUsage();
      usage.count += 1;
      saveUsage(usage);
    }

    function scrollToLatest() {
      requestAnimationFrame(function () {
        chatBody.scrollTop = chatBody.scrollHeight;
      });
    }

    function isSafeStoomLink(href) {
      const value = String(href || "").trim();

      return /^(?:[a-z0-9-]+\.html)(?:#[a-z0-9-]+)?(?:\?[a-z0-9=&%._-]+)?$/i.test(value);
    }

    function appendAssistantText(container, text) {
      const value = String(text || "");
      const linkPattern = /\[([^\]\n]{1,120})\]\(([^)\n]{1,240})\)/g;

      let cursor = 0;
      let match;

      while ((match = linkPattern.exec(value)) !== null) {
        const before = value.slice(cursor, match.index);

        if (before) {
          container.appendChild(document.createTextNode(before));
        }

        const label = match[1].trim();
        const href = match[2].trim();

        if (label && isSafeStoomLink(href)) {
          const link = document.createElement("a");
          link.className = "stoom-chat-product-link";
          link.href = href;
          link.textContent = label;
          link.setAttribute("aria-label", "Voir " + label + " dans le catalogue STOOM");
          container.appendChild(link);
        } else {
          container.appendChild(document.createTextNode(match[0]));
        }

        cursor = linkPattern.lastIndex;
      }

      const remaining = value.slice(cursor);

      if (remaining) {
        container.appendChild(document.createTextNode(remaining));
      }
    }

    function addMessage(role, text) {
      const item = document.createElement("article");
      item.className = "stoom-chat-message " + role;

      const label = document.createElement("span");
      label.className = "stoom-chat-message-label";
      label.textContent = role === "user" ? "Vous" : "Camille · STOOM";

      const content = document.createElement("p");
      content.className = "stoom-chat-message-text";

      if (role === "assistant") {
        appendAssistantText(content, text);
      } else {
        content.textContent = text;
      }

      item.append(label, content);
      messages.appendChild(item);
      scrollToLatest();

      return item;
    }

    function addTyping() {
      const item = document.createElement("article");
      item.className = "stoom-chat-message assistant";
      item.setAttribute("aria-label", "Camille rédige sa réponse");

      const typing = document.createElement("div");
      typing.className = "stoom-chat-typing";

      for (let index = 0; index < 3; index += 1) {
        const dot = document.createElement("span");
        dot.setAttribute("aria-hidden", "true");
        typing.appendChild(dot);
      }

      item.appendChild(typing);
      messages.appendChild(item);
      scrollToLatest();

      return item;
    }

    function greet() {
      if (greeted) return;

      greeted = true;

      addMessage(
        "assistant",
        "Bonjour, je suis Camille, le guide virtuel STOOM. Je peux t’aider à trouver une cartouche ou une résistance compatible, préparer un DIY, vérifier un problème simple ou orienter ton choix de matériel."
      );
    }

    function openChat() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      launcher.setAttribute("aria-expanded", "true");
      document.body.classList.add("stoom-chat-open");

      greet();
      track("stoom_assistant_open");

      window.setTimeout(function () {
        input.focus();
      }, 120);
    }

    function closeChat() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      launcher.setAttribute("aria-expanded", "false");
      document.body.classList.remove("stoom-chat-open");
      launcher.focus();
    }

    function setPending(value) {
      pending = value;
      input.disabled = value;
      sendButton.disabled = value;
      sendButton.textContent = value ? "Réponse…" : "Envoyer";
    }

    function remember(role, text) {
      history.push({
        role: role,
        content: text
      });

      if (history.length > maxHistoryMessages) {
        history = history.slice(-maxHistoryMessages);
      }
    }

    async function askAssistant(rawMessage, source) {
      const message = String(rawMessage || "").trim();

      if (!message || pending) return;

      if (!canAskQuestion()) {
        addMessage(
          "assistant",
          "Pour préserver le service, cette conversation est limitée à cinq questions sur quinze minutes. Pour une urgence matériel ou une compatibilité précise, appelle STOOM au 04 73 27 33 94 ou passe en boutique avec ton matériel."
        );
        return;
      }

      quickPrompts.hidden = true;

      addMessage("user", message);
      remember("user", message);
      incrementUsage();
      setPending(true);

      const typing = addTyping();

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            message: message,
            history: history.slice(0, -1),
            page: window.location.pathname
          })
        });

        const data = await response.json().catch(function () {
          return {};
        });

        typing.remove();

        if (!response.ok || !data.reply) {
          throw new Error(data.error || "Réponse indisponible");
        }

        const reply = String(data.reply).trim();

        addMessage("assistant", reply);
        remember("assistant", reply);

        track("stoom_assistant_question", {
          assistant_source: source || "message"
        });
      } catch (error) {
        typing.remove();

        addMessage(
          "assistant",
          "Je n’arrive pas à répondre pour le moment. Tu peux appeler STOOM au 04 73 27 33 94 ou venir avec ton matériel au 109 avenue Édouard Michelin à Clermont-Ferrand."
        );

        track("stoom_assistant_error");
      } finally {
        setPending(false);
        input.focus();
      }
    }

    launcher.addEventListener("click", openChat);
    closeButton.addEventListener("click", closeChat);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const message = input.value;
      input.value = "";

      askAssistant(message, "message");
    });

    quickPrompts.querySelectorAll("button[data-prompt]").forEach(function (button) {
      button.addEventListener("click", function () {
        askAssistant(button.getAttribute("data-prompt"), "quick_prompt");
      });
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        closeChat();
      }
    });
  }
})();

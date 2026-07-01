(function(){
  "use strict";

  const CONFIG = {
    consentKey: "stoom_cookie_consent_v1",
    consentCookie: "stoom_cookie_consent",
    consentDays: 183,
    gtmId: "GTM-WCXHT7C9",
    googleMapsQuery: "STOOM Clermont-Ferrand 109 B avenue Edouard Michelin"
  };

  const DEFAULTS = { analytics: false, maps: false };

  function readStoredConsent(){
    try{
      const local = window.localStorage.getItem(CONFIG.consentKey);
      if(local) return JSON.parse(local);
    }catch(error){}

    const match = document.cookie.match(new RegExp("(?:^|; )" + CONFIG.consentCookie.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    if(match){
      try{ return JSON.parse(decodeURIComponent(match[1])); }catch(error){}
    }
    return null;
  }

  function normaliseConsent(record){
    const preferences = record && record.preferences ? record.preferences : {};
    return {
      analytics: preferences.analytics === true,
      maps: preferences.maps === true
    };
  }

  function writeConsent(preferences){
    const record = {
      version: 1,
      updatedAt: new Date().toISOString(),
      preferences: {
        analytics: preferences.analytics === true,
        maps: preferences.maps === true
      }
    };
    const value = JSON.stringify(record);
    try{ window.localStorage.setItem(CONFIG.consentKey, value); }catch(error){}
    document.cookie = CONFIG.consentCookie + "=" + encodeURIComponent(value) + "; path=/; max-age=" + (CONFIG.consentDays * 86400) + "; SameSite=Lax; Secure";
    return record;
  }

  let preferences = normaliseConsent(readStoredConsent());

  function injectStyles(){
    if(document.getElementById("stoom-site-shell-style")) return;

    const style = document.createElement("style");
    style.id = "stoom-site-shell-style";
    style.textContent = `
      .stoom-site-footer{position:relative;padding:58px 0 0 !important;background:#04131c !important;border-top:1px solid rgba(142,234,255,.18) !important;color:#eaf8ff !important;font-family:Montserrat,Arial,sans-serif}
      .stoom-site-footer *{box-sizing:border-box}
      .stoom-site-footer .container{width:min(1220px,calc(100% - 28px));margin:auto}
      .stoom-footer-grid{display:grid;grid-template-columns:1.28fr .9fr 1.1fr .88fr;gap:36px;padding-bottom:42px}
      .stoom-footer-brand{max-width:340px}
      .stoom-footer-logo{display:inline-flex;align-items:center;gap:11px;margin-bottom:17px}
      .stoom-footer-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#55d4ff,#8eeaff);color:#06131d;font-size:1.18rem;font-weight:950;box-shadow:0 0 25px rgba(85,212,255,.18)}
      .stoom-footer-logo > span:last-child > strong{display:block;color:#fff;font-size:1.5rem;line-height:.86;letter-spacing:2px}
      .stoom-footer-logo > span:last-child > span{display:block;margin-top:5px;color:#8eeaff;font-size:.57rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase}
      .stoom-footer-brand p{margin:0;color:#b9d0db;font-size:.82rem;font-weight:600;line-height:1.7}
      .stoom-footer-adult{display:inline-flex;margin-top:16px;padding:8px 10px;border:1px solid rgba(142,234,255,.20);border-radius:999px;color:#d9f5ff;background:rgba(142,234,255,.06);font-size:.57rem;font-weight:900;letter-spacing:.055em;text-transform:uppercase}
      .stoom-footer-title{margin:4px 0 15px;color:#8eeaff;font-size:.59rem;font-weight:950;letter-spacing:.11em;text-transform:uppercase}
      .stoom-footer-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}
      .stoom-footer-list a,.stoom-footer-list button{display:inline;color:#d9edf5;background:none;border:0;padding:0;font:inherit;font-size:.78rem;font-weight:650;line-height:1.5;text-align:left;cursor:pointer}
      .stoom-footer-list a:hover,.stoom-footer-list a:focus-visible,.stoom-footer-list button:hover,.stoom-footer-list button:focus-visible{color:#8eeaff;outline:none}
      .stoom-footer-address{color:#d9edf5;font-size:.78rem;font-weight:650;line-height:1.65;font-style:normal}
      .stoom-footer-contact{margin-top:12px}
      .stoom-footer-contact a{display:block;color:#d9edf5;font-size:.78rem;font-weight:700;line-height:1.7}
      .stoom-footer-contact a:hover{color:#8eeaff}
      .stoom-footer-basalt{margin-top:18px;padding-top:15px;border-top:1px solid rgba(255,255,255,.10);color:#9db9c5;font-size:.68rem;font-weight:650;line-height:1.55}
      .stoom-footer-basalt b{color:#8eeaff;font-weight:900;letter-spacing:.04em}
      .stoom-footer-bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0 calc(18px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,.10);color:#9db9c5;font-size:.66rem;font-weight:650;line-height:1.55}
      .stoom-footer-legal{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px 14px}
      .stoom-footer-legal a,.stoom-footer-legal button{color:#c9e8f3;background:none;border:0;padding:0;font:inherit;font-size:.66rem;font-weight:750;cursor:pointer}
      .stoom-footer-legal a:hover,.stoom-footer-legal button:hover,.stoom-footer-legal a:focus-visible,.stoom-footer-legal button:focus-visible{color:#8eeaff;outline:none}

      .stoom-cookie-layer{position:fixed;z-index:99998;right:16px;bottom:16px;left:16px;display:flex;justify-content:center;pointer-events:none;font-family:Montserrat,Arial,sans-serif}
      .stoom-cookie-layer[hidden]{display:none}
      .stoom-cookie-panel{width:min(100%,730px);padding:22px;border:1px solid rgba(142,234,255,.28);border-radius:22px;background:linear-gradient(145deg,rgba(7,29,40,.985),rgba(3,15,23,.985));box-shadow:0 28px 86px rgba(0,0,0,.52);color:#edfaff;pointer-events:auto}
      .stoom-cookie-kicker{display:block;margin-bottom:8px;color:#8eeaff;font-size:.58rem;font-weight:950;letter-spacing:.1em;text-transform:uppercase}
      .stoom-cookie-panel h2{margin:0;color:#fff;font-family:Georgia,serif;font-size:clamp(1.55rem,4vw,2.15rem);font-weight:400;line-height:1}
      .stoom-cookie-panel p{max-width:660px;margin:12px 0 0;color:#c7dce5;font-size:.80rem;font-weight:600;line-height:1.65}
      .stoom-cookie-panel a{color:#8eeaff;text-decoration:underline;text-underline-offset:3px}
      .stoom-cookie-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}
      .stoom-cookie-btn{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:0 14px;border:1px solid rgba(255,255,255,.18);border-radius:13px;background:rgba(255,255,255,.06);color:#f2fbff;font:inherit;font-size:.68rem;font-weight:900;letter-spacing:.02em;text-transform:uppercase;cursor:pointer}
      .stoom-cookie-btn:hover,.stoom-cookie-btn:focus-visible{border-color:#8eeaff;background:rgba(142,234,255,.13);outline:none}
      .stoom-cookie-btn-primary{border-color:transparent;background:linear-gradient(135deg,#55d4ff,#8eeaff);color:#06131d}
      .stoom-cookie-btn-primary:hover,.stoom-cookie-btn-primary:focus-visible{background:linear-gradient(135deg,#77deff,#b8f4ff)}
      .stoom-cookie-preferences{display:none;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
      .stoom-cookie-layer.is-customising .stoom-cookie-preferences{display:block}
      .stoom-cookie-layer.is-customising .stoom-cookie-main-actions{display:none}
      .stoom-cookie-choice{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.09)}
      .stoom-cookie-choice:first-child{padding-top:0}
      .stoom-cookie-choice:last-child{padding-bottom:0;border-bottom:0}
      .stoom-cookie-choice strong{display:block;color:#fff;font-size:.78rem;font-weight:900}
      .stoom-cookie-choice span{display:block;margin-top:4px;color:#b9d0db;font-size:.72rem;font-weight:600;line-height:1.5}
      .stoom-cookie-switch{position:relative;display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;color:#d9f5ff;font-size:.66rem;font-weight:850;cursor:pointer}
      .stoom-cookie-switch input{position:absolute;opacity:0;pointer-events:none}
      .stoom-cookie-switch i{position:relative;display:block;width:42px;height:24px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(255,255,255,.10);transition:.2s}
      .stoom-cookie-switch i::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#eaf8ff;transition:.2s}
      .stoom-cookie-switch input:checked + i{border-color:#8eeaff;background:#55d4ff}
      .stoom-cookie-switch input:checked + i::after{transform:translateX(18px);background:#06131d}
      .stoom-cookie-custom-actions{display:flex;gap:9px;margin-top:16px}

      .stoom-map-consent{min-height:inherit;height:100%;display:flex;align-items:center;justify-content:center;padding:28px;border:1px solid rgba(142,234,255,.22);border-radius:inherit;background:radial-gradient(circle at 50% 0%,rgba(85,212,255,.14),transparent 55%),#071720;color:#eaf8ff;text-align:center;font-family:Montserrat,Arial,sans-serif}
      .stoom-map-consent-inner{max-width:350px}
      .stoom-map-consent small{display:block;margin-bottom:8px;color:#8eeaff;font-size:.60rem;font-weight:950;letter-spacing:.1em;text-transform:uppercase}
      .stoom-map-consent strong{display:block;color:#fff;font-family:Georgia,serif;font-size:1.65rem;font-weight:400;line-height:1}
      .stoom-map-consent p{margin:10px 0 16px;color:#bfd4de;font-size:.77rem;font-weight:600;line-height:1.6}
      .stoom-map-consent button{min-height:42px;border:0;border-radius:12px;padding:0 14px;background:linear-gradient(135deg,#55d4ff,#8eeaff);color:#06131d;font:inherit;font-size:.66rem;font-weight:900;letter-spacing:.02em;text-transform:uppercase;cursor:pointer}

      @media(max-width:980px){.stoom-footer-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:31px}.stoom-footer-bottom{align-items:flex-start;flex-direction:column}.stoom-footer-legal{justify-content:flex-start}}
      @media(max-width:640px){.stoom-site-footer{padding-top:42px !important;padding-bottom:78px}.stoom-footer-grid{grid-template-columns:1fr;gap:27px;padding-bottom:31px}.stoom-footer-bottom{font-size:.62rem}.stoom-footer-legal{gap:7px 12px}.stoom-cookie-layer{right:10px;bottom:10px;left:10px}.stoom-cookie-panel{padding:18px;border-radius:19px}.stoom-cookie-actions,.stoom-cookie-custom-actions{display:grid;grid-template-columns:1fr}.stoom-cookie-btn{width:100%}.stoom-cookie-choice{gap:12px}.stoom-cookie-choice strong{font-size:.74rem}.stoom-cookie-choice span{font-size:.68rem}}
      @media(prefers-reduced-motion:reduce){.stoom-cookie-switch i,.stoom-cookie-switch i::after{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function footerMarkup(){
    const year = new Date().getFullYear();
    return `
      <footer class="stoom-site-footer" aria-label="Pied de page">
        <div class="container stoom-footer-grid">
          <div class="stoom-footer-brand">
            <a class="stoom-footer-logo" href="index.html" aria-label="Retour à l'accueil STOOM">
              <span class="stoom-footer-mark">S</span>
              <span><strong>STOOM</strong><span>Clermont-Ferrand</span></span>
            </a>
            <p>Boutique spécialisée en cigarette électronique, e-liquides, matériel et conseils personnalisés à Clermont-Ferrand.</p>
            <span class="stoom-footer-adult">Produits de vapotage réservés aux majeurs</span>
          </div>

          <nav aria-label="Navigation du pied de page">
            <h2 class="stoom-footer-title">Explorer</h2>
            <ul class="stoom-footer-list">
              <li><a href="index.html">Catalogue</a></li>
              <li><a href="materiel.html">Matériel</a></li>
              <li><a href="diy.html">DIY</a></li>
              <li><a href="economies.html">Économies</a></li>
              <li><a href="concours.html">Concours</a></li>
              <li><a href="contact.html">Contact &amp; horaires</a></li>
            </ul>
          </nav>

          <section aria-label="Informations boutique">
            <h2 class="stoom-footer-title">La boutique</h2>
            <address class="stoom-footer-address">109 B avenue Édouard Michelin<br>63100 Clermont-Ferrand</address>
            <div class="stoom-footer-contact">
              <a href="tel:0473273394">04 73 27 33 94</a>
              <a href="mailto:contactstoom63@gmail.com">contactstoom63@gmail.com</a>
              <a href="contact.html">Lun.–ven. 8h30–19h · Sam. 9h–19h</a>
            </div>
          </section>

          <section aria-label="Réseaux et informations">
            <h2 class="stoom-footer-title">Suivre STOOM</h2>
            <ul class="stoom-footer-list">
              <li><a href="https://www.instagram.com/stoomclermontferrand/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://www.google.com/search?q=STOOM+Cigarettes+%C3%A9lectronique+Clermont-Ferrand+avis" target="_blank" rel="noopener noreferrer">Avis Google</a></li>
              <li><a href="contact.html">Itinéraire &amp; horaires</a></li>
            </ul>
            <p class="stoom-footer-basalt">Site créé avec <b>BASALTE-WEB</b></p>
          </section>
        </div>

        <div class="container stoom-footer-bottom">
          <span>© ${year} STOOM · SAS au capital de 1 500 € · Pas de vente en ligne</span>
          <nav class="stoom-footer-legal" aria-label="Informations légales">
            <a href="mentions-legales.html">Mentions légales</a>
            <a href="politique-confidentialite.html">Confidentialité</a>
            <a href="politique-cookies.html">Cookies</a>
            <a href="reglement-concours.html">Règlement concours</a>
            <button type="button" data-open-cookie-settings>Gérer mes cookies</button>
          </nav>
        </div>
      </footer>
    `;
  }

  function injectFooter(){
    const current = document.querySelector("footer");
    if(current && !current.classList.contains("stoom-site-footer")){
      current.outerHTML = footerMarkup();
    }else if(!current){
      document.body.insertAdjacentHTML("beforeend", footerMarkup());
    }
  }

  function mapFrames(){
    return Array.from(document.querySelectorAll('iframe[data-stoom-map], iframe[src*="google.com/maps"]'));
  }

  function manageMaps(){
    mapFrames().forEach(function(frame, index){
      if(!frame.dataset.stoomMapId) frame.dataset.stoomMapId = "stoom-map-" + index;
      if(!frame.dataset.src){
        const originalSrc = frame.getAttribute("src");
        if(originalSrc && originalSrc !== "about:blank") frame.dataset.src = originalSrc;
      }

      const frameId = frame.dataset.stoomMapId;
      let placeholder = document.querySelector('[data-stoom-map-placeholder="' + frameId + '"]');

      if(preferences.maps && frame.dataset.src){
        if(placeholder) placeholder.remove();
        frame.hidden = false;
        if(frame.getAttribute("src") !== frame.dataset.src) frame.setAttribute("src", frame.dataset.src);
        return;
      }

      frame.setAttribute("src", "about:blank");
      frame.hidden = true;

      if(!placeholder){
        placeholder = document.createElement("div");
        placeholder.className = "stoom-map-consent";
        placeholder.dataset.stoomMapPlaceholder = frameId;
        placeholder.innerHTML = `
          <div class="stoom-map-consent-inner">
            <small>Carte Google Maps</small>
            <strong>La carte est désactivée</strong>
            <p>Google Maps est un service externe. Activez-le pour afficher la carte interactive et préparer votre trajet.</p>
            <button type="button">Afficher la carte</button>
          </div>
        `;
        frame.insertAdjacentElement("afterend", placeholder);
        placeholder.querySelector("button").addEventListener("click", function(){
          preferences.maps = true;
          writeConsent(preferences);
          applyPreferences();
        });
      }
    });
  }

  function loadTagManager(){
    if(!preferences.analytics || document.querySelector('script[data-stoom-gtm="true"]')) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.stoomGtm = "true";
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.gtmId);
    document.head.appendChild(script);
  }

  function applyPreferences(){
    document.documentElement.dataset.stoomAnalytics = preferences.analytics ? "granted" : "denied";
    document.documentElement.dataset.stoomMaps = preferences.maps ? "granted" : "denied";
    manageMaps();
    loadTagManager();
  }

  function buildCookieLayer(){
    if(document.getElementById("stoomCookieLayer")) return document.getElementById("stoomCookieLayer");

    const layer = document.createElement("div");
    layer.className = "stoom-cookie-layer";
    layer.id = "stoomCookieLayer";
    layer.hidden = true;
    layer.innerHTML = `
      <section class="stoom-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="stoomCookieTitle">
        <div class="stoom-cookie-main">
          <span class="stoom-cookie-kicker">Votre confidentialité</span>
          <h2 id="stoomCookieTitle">Vos choix, simplement.</h2>
          <p>STOOM utilise des cookies strictement nécessaires au fonctionnement du site. Les statistiques et Google Maps ne sont activés qu’avec votre accord. Consultez notre <a href="politique-cookies.html">politique cookies</a>.</p>
          <div class="stoom-cookie-actions stoom-cookie-main-actions">
            <button class="stoom-cookie-btn stoom-cookie-btn-primary" type="button" data-cookie-action="accept">Tout accepter</button>
            <button class="stoom-cookie-btn" type="button" data-cookie-action="reject">Tout refuser</button>
            <button class="stoom-cookie-btn" type="button" data-cookie-action="customise">Personnaliser</button>
          </div>
        </div>

        <div class="stoom-cookie-preferences">
          <span class="stoom-cookie-kicker">Personnaliser</span>
          <div class="stoom-cookie-choice">
            <div>
              <strong>Fonctionnement essentiel</strong>
              <span>Mémorise votre majorité et vos choix de confidentialité. Toujours actif.</span>
            </div>
            <span class="stoom-cookie-switch" aria-label="Toujours actif"><i></i>Actif</span>
          </div>
          <div class="stoom-cookie-choice">
            <div>
              <strong>Mesure d’audience</strong>
              <span>Autorise Google Tag Manager pour mesurer l’utilisation du site et améliorer ses contenus.</span>
            </div>
            <label class="stoom-cookie-switch">
              <input type="checkbox" data-cookie-preference="analytics">
              <i></i><span>Autoriser</span>
            </label>
          </div>
          <div class="stoom-cookie-choice">
            <div>
              <strong>Contenu externe : Google Maps</strong>
              <span>Autorise l’affichage de la carte interactive Google Maps sur les pages qui en proposent une.</span>
            </div>
            <label class="stoom-cookie-switch">
              <input type="checkbox" data-cookie-preference="maps">
              <i></i><span>Autoriser</span>
            </label>
          </div>
          <div class="stoom-cookie-custom-actions">
            <button class="stoom-cookie-btn stoom-cookie-btn-primary" type="button" data-cookie-action="save">Enregistrer mes choix</button>
            <button class="stoom-cookie-btn" type="button" data-cookie-action="back">Retour</button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(layer);

    layer.querySelector('[data-cookie-action="accept"]').addEventListener("click", function(){
      preferences = { analytics: true, maps: true };
      writeConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    layer.querySelector('[data-cookie-action="reject"]').addEventListener("click", function(){
      preferences = { analytics: false, maps: false };
      writeConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    layer.querySelector('[data-cookie-action="customise"]').addEventListener("click", function(){
      layer.classList.add("is-customising");
      syncCookieForm();
    });

    layer.querySelector('[data-cookie-action="back"]').addEventListener("click", function(){
      layer.classList.remove("is-customising");
    });

    layer.querySelector('[data-cookie-action="save"]').addEventListener("click", function(){
      preferences = {
        analytics: layer.querySelector('[data-cookie-preference="analytics"]').checked,
        maps: layer.querySelector('[data-cookie-preference="maps"]').checked
      };
      writeConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    return layer;
  }

  function syncCookieForm(){
    const layer = buildCookieLayer();
    layer.querySelector('[data-cookie-preference="analytics"]').checked = preferences.analytics;
    layer.querySelector('[data-cookie-preference="maps"]').checked = preferences.maps;
  }

  function openCookieLayer(customise){
    const layer = buildCookieLayer();
    syncCookieForm();
    layer.hidden = false;
    layer.classList.toggle("is-customising", customise === true);
    const focusTarget = customise ? layer.querySelector('[data-cookie-preference="analytics"]') : layer.querySelector('[data-cookie-action="accept"]');
    if(focusTarget) window.setTimeout(function(){ focusTarget.focus(); }, 0);
  }

  function closeCookieLayer(){
    const layer = document.getElementById("stoomCookieLayer");
    if(layer) layer.hidden = true;
  }

  function bindCookieButtons(){
    document.addEventListener("click", function(event){
      const trigger = event.target.closest("[data-open-cookie-settings]");
      if(!trigger) return;
      event.preventDefault();
      openCookieLayer(true);
    });
  }

  function boot(){
    injectStyles();
    injectFooter();
    bindCookieButtons();
    buildCookieLayer();
    applyPreferences();

    if(!readStoredConsent()) openCookieLayer(false);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }else{
    boot();
  }

  window.STOOMCookieConsent = {
    openPreferences: function(){ openCookieLayer(true); },
    getPreferences: function(){ return Object.assign({}, preferences); }
  };
})();
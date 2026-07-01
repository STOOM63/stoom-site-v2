(function () {
  "use strict";

  const CONFIG = {
    consentKey: "stoom_cookie_consent_v1",
    consentCookie: "stoom_cookie_consent",
    consentDays: 183,
    gtmId: "GTM-WCXHT7C9"
  };

  const DEFAULTS = { analytics: false, maps: false };

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function readStoredConsent() {
    try {
      const local = window.localStorage.getItem(CONFIG.consentKey);
      const parsed = safeParse(local);
      if (parsed) return parsed;
    } catch (error) {}

    const escapedName = CONFIG.consentCookie.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp("(?:^|; )" + escapedName + "=([^;]*)"));

    return match ? safeParse(decodeURIComponent(match[1])) : null;
  }

  function normaliseConsent(record) {
    const values = record && record.preferences ? record.preferences : {};
    return {
      analytics: values.analytics === true,
      maps: values.maps === true
    };
  }

  function saveConsent(values) {
    const record = {
      version: 1,
      updatedAt: new Date().toISOString(),
      preferences: {
        analytics: values.analytics === true,
        maps: values.maps === true
      }
    };

    const serialized = JSON.stringify(record);

    try {
      window.localStorage.setItem(CONFIG.consentKey, serialized);
    } catch (error) {}

    document.cookie =
      CONFIG.consentCookie +
      "=" +
      encodeURIComponent(serialized) +
      "; path=/; max-age=" +
      (CONFIG.consentDays * 86400) +
      "; SameSite=Lax; Secure";

    return record;
  }

  let preferences = normaliseConsent(readStoredConsent());

  function injectStyles() {
    if (document.getElementById("stoom-site-shell-style")) return;

    const style = document.createElement("style");
    style.id = "stoom-site-shell-style";
    style.textContent = `
      .stoom-site-footer{
        position:relative !important;
        margin:0 !important;
        padding:56px 0 0 !important;
        background:#04131c !important;
        border-top:1px solid rgba(142,234,255,.18) !important;
        color:#eaf8ff !important;
        font-family:Montserrat,Arial,sans-serif !important;
      }

      .stoom-site-footer,
      .stoom-site-footer *{
        box-sizing:border-box !important;
      }

      .stoom-site-footer .container{
        width:min(1220px,calc(100% - 28px)) !important;
        margin:0 auto !important;
      }

      .stoom-footer-grid{
        display:grid !important;
        grid-template-columns:1.28fr .9fr 1.1fr .88fr !important;
        align-items:start !important;
        gap:36px !important;
        padding:0 0 42px !important;
      }

      .stoom-footer-grid > *{
        display:block !important;
        align-self:start !important;
        margin:0 !important;
        padding:0 !important;
        min-width:0 !important;
      }

      .stoom-footer-brand{
        max-width:340px !important;
      }

      .stoom-footer-logo{
        display:inline-flex !important;
        align-items:center !important;
        gap:11px !important;
        margin:0 0 17px !important;
        padding:0 !important;
        color:#fff !important;
        text-decoration:none !important;
      }

      .stoom-footer-mark{
        width:42px !important;
        height:42px !important;
        min-width:42px !important;
        min-height:42px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        flex:0 0 42px !important;
        margin:0 !important;
        padding:0 !important;
        overflow:visible !important;
        border-radius:15px !important;
        background:linear-gradient(135deg,#55d4ff,#8eeaff) !important;
        color:#06131d !important;
        font-family:Arial,Helvetica,sans-serif !important;
        font-size:1.12rem !important;
        font-weight:950 !important;
        line-height:1 !important;
        text-indent:0 !important;
        text-align:center !important;
        letter-spacing:0 !important;
        text-transform:none !important;
        box-shadow:0 0 25px rgba(85,212,255,.18) !important;
      }

      .stoom-footer-logo-copy{
        display:block !important;
        margin:0 !important;
        padding:0 !important;
        line-height:1 !important;
      }

      .stoom-footer-logo-copy strong{
        display:block !important;
        margin:0 !important;
        padding:0 !important;
        color:#fff !important;
        font-size:1.5rem !important;
        font-weight:950 !important;
        line-height:.86 !important;
        letter-spacing:2px !important;
      }

      .stoom-footer-logo-copy small{
        display:block !important;
        margin:5px 0 0 !important;
        padding:0 !important;
        color:#8eeaff !important;
        font-size:.57rem !important;
        font-weight:900 !important;
        line-height:1 !important;
        letter-spacing:.15em !important;
        text-transform:uppercase !important;
      }

      .stoom-footer-brand p{
        margin:0 !important;
        color:#b9d0db !important;
        font-size:.82rem !important;
        font-weight:600 !important;
        line-height:1.7 !important;
      }

      .stoom-footer-adult{
        display:inline-flex !important;
        align-items:center !important;
        margin:16px 0 0 !important;
        padding:8px 10px !important;
        border:1px solid rgba(142,234,255,.20) !important;
        border-radius:999px !important;
        color:#d9f5ff !important;
        background:rgba(142,234,255,.06) !important;
        font-size:.57rem !important;
        font-weight:900 !important;
        line-height:1 !important;
        letter-spacing:.055em !important;
        text-transform:uppercase !important;
      }

      .stoom-footer-title{
        display:block !important;
        margin:4px 0 15px !important;
        padding:0 !important;
        color:#8eeaff !important;
        font-size:.59rem !important;
        font-weight:950 !important;
        line-height:1.2 !important;
        letter-spacing:.11em !important;
        text-transform:uppercase !important;
      }

      .stoom-footer-list{
        display:grid !important;
        gap:9px !important;
        margin:0 !important;
        padding:0 !important;
        list-style:none !important;
      }

      .stoom-footer-list li{
        display:block !important;
        margin:0 !important;
        padding:0 !important;
      }

      .stoom-footer-list a,
      .stoom-footer-list button{
        display:inline !important;
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
        background:transparent !important;
        color:#d9edf5 !important;
        font:inherit !important;
        font-size:.78rem !important;
        font-weight:650 !important;
        line-height:1.5 !important;
        text-align:left !important;
        text-decoration:none !important;
        cursor:pointer !important;
      }

      .stoom-footer-list a:hover,
      .stoom-footer-list a:focus-visible,
      .stoom-footer-list button:hover,
      .stoom-footer-list button:focus-visible{
        color:#8eeaff !important;
        outline:none !important;
      }

      .stoom-footer-address{
        display:block !important;
        margin:0 !important;
        padding:0 !important;
        color:#d9edf5 !important;
        font-family:inherit !important;
        font-size:.78rem !important;
        font-style:normal !important;
        font-weight:650 !important;
        line-height:1.65 !important;
      }

      .stoom-footer-contact{
        display:grid !important;
        gap:2px !important;
        margin:12px 0 0 !important;
        padding:0 !important;
      }

      .stoom-footer-contact a{
        display:block !important;
        margin:0 !important;
        padding:0 !important;
        color:#d9edf5 !important;
        font-size:.78rem !important;
        font-weight:700 !important;
        line-height:1.7 !important;
        text-decoration:none !important;
      }

      .stoom-footer-contact a:hover,
      .stoom-footer-contact a:focus-visible{
        color:#8eeaff !important;
        outline:none !important;
      }

      .stoom-footer-basalt{
        margin:18px 0 0 !important;
        padding:15px 0 0 !important;
        border-top:1px solid rgba(255,255,255,.10) !important;
        color:#9db9c5 !important;
        font-size:.68rem !important;
        font-weight:650 !important;
        line-height:1.55 !important;
      }

      .stoom-footer-basalt b{
        color:#8eeaff !important;
        font-weight:900 !important;
        letter-spacing:.04em !important;
      }

      .stoom-footer-bottom{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:16px !important;
        margin:0 !important;
        padding:18px 0 calc(18px + env(safe-area-inset-bottom)) !important;
        border-top:1px solid rgba(255,255,255,.10) !important;
        color:#9db9c5 !important;
        font-size:.66rem !important;
        font-weight:650 !important;
        line-height:1.55 !important;
      }

      .stoom-footer-legal{
        display:flex !important;
        align-items:center !important;
        justify-content:flex-end !important;
        flex-wrap:wrap !important;
        gap:8px 14px !important;
        margin:0 !important;
        padding:0 !important;
      }

      .stoom-footer-legal a,
      .stoom-footer-legal button{
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
        background:transparent !important;
        color:#c9e8f3 !important;
        font:inherit !important;
        font-size:.66rem !important;
        font-weight:750 !important;
        line-height:1.4 !important;
        text-decoration:none !important;
        cursor:pointer !important;
      }

      .stoom-footer-legal a:hover,
      .stoom-footer-legal a:focus-visible,
      .stoom-footer-legal button:hover,
      .stoom-footer-legal button:focus-visible{
        color:#8eeaff !important;
        outline:none !important;
      }

      .stoom-cookie-layer{
        position:fixed !important;
        z-index:99998 !important;
        right:16px !important;
        bottom:16px !important;
        left:16px !important;
        display:flex !important;
        justify-content:center !important;
        pointer-events:none !important;
        font-family:Montserrat,Arial,sans-serif !important;
      }

      .stoom-cookie-layer[hidden]{display:none !important}

      .stoom-cookie-panel{
        width:min(100%,730px) !important;
        margin:0 !important;
        padding:22px !important;
        border:1px solid rgba(142,234,255,.28) !important;
        border-radius:22px !important;
        background:linear-gradient(145deg,rgba(7,29,40,.985),rgba(3,15,23,.985)) !important;
        box-shadow:0 28px 86px rgba(0,0,0,.52) !important;
        color:#edfaff !important;
        pointer-events:auto !important;
      }

      .stoom-cookie-kicker{
        display:block !important;
        margin:0 0 8px !important;
        color:#8eeaff !important;
        font-size:.58rem !important;
        font-weight:950 !important;
        line-height:1.2 !important;
        letter-spacing:.1em !important;
        text-transform:uppercase !important;
      }

      .stoom-cookie-panel h2{
        margin:0 !important;
        color:#fff !important;
        font-family:Georgia,serif !important;
        font-size:clamp(1.55rem,4vw,2.15rem) !important;
        font-weight:400 !important;
        line-height:1 !important;
      }

      .stoom-cookie-panel p{
        max-width:660px !important;
        margin:12px 0 0 !important;
        color:#c7dce5 !important;
        font-size:.80rem !important;
        font-weight:600 !important;
        line-height:1.65 !important;
      }

      .stoom-cookie-panel a{
        color:#8eeaff !important;
        text-decoration:underline !important;
        text-underline-offset:3px !important;
      }

      .stoom-cookie-actions{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:9px !important;
        margin:18px 0 0 !important;
        padding:0 !important;
      }

      .stoom-cookie-btn{
        min-height:44px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        margin:0 !important;
        padding:0 14px !important;
        border:1px solid rgba(255,255,255,.18) !important;
        border-radius:13px !important;
        background:rgba(255,255,255,.06) !important;
        color:#f2fbff !important;
        font:inherit !important;
        font-size:.68rem !important;
        font-weight:900 !important;
        line-height:1 !important;
        letter-spacing:.02em !important;
        text-transform:uppercase !important;
        cursor:pointer !important;
      }

      .stoom-cookie-btn:hover,
      .stoom-cookie-btn:focus-visible{
        border-color:#8eeaff !important;
        background:rgba(142,234,255,.13) !important;
        outline:none !important;
      }

      .stoom-cookie-btn-primary{
        border-color:transparent !important;
        background:linear-gradient(135deg,#55d4ff,#8eeaff) !important;
        color:#06131d !important;
      }

      .stoom-cookie-preferences{
        display:none !important;
        margin:18px 0 0 !important;
        padding:16px 0 0 !important;
        border-top:1px solid rgba(255,255,255,.12) !important;
      }

      .stoom-cookie-layer.is-customising .stoom-cookie-preferences{
        display:block !important;
      }

      .stoom-cookie-layer.is-customising .stoom-cookie-main-actions{
        display:none !important;
      }

      .stoom-cookie-choice{
        display:flex !important;
        align-items:flex-start !important;
        justify-content:space-between !important;
        gap:18px !important;
        margin:0 !important;
        padding:14px 0 !important;
        border-bottom:1px solid rgba(255,255,255,.09) !important;
      }

      .stoom-cookie-choice:first-child{padding-top:0 !important}
      .stoom-cookie-choice:last-child{padding-bottom:0 !important;border-bottom:0 !important}

      .stoom-cookie-choice strong{
        display:block !important;
        margin:0 !important;
        color:#fff !important;
        font-size:.78rem !important;
        font-weight:900 !important;
      }

      .stoom-cookie-choice span{
        display:block !important;
        margin:4px 0 0 !important;
        color:#b9d0db !important;
        font-size:.72rem !important;
        font-weight:600 !important;
        line-height:1.5 !important;
      }

      .stoom-cookie-switch{
        position:relative !important;
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        flex:0 0 auto !important;
        margin:0 !important;
        color:#d9f5ff !important;
        font-size:.66rem !important;
        font-weight:850 !important;
        cursor:pointer !important;
      }

      .stoom-cookie-switch input{
        position:absolute !important;
        opacity:0 !important;
        pointer-events:none !important;
      }

      .stoom-cookie-switch i{
        position:relative !important;
        display:block !important;
        width:42px !important;
        height:24px !important;
        margin:0 !important;
        border:1px solid rgba(255,255,255,.25) !important;
        border-radius:999px !important;
        background:rgba(255,255,255,.10) !important;
        transition:.2s !important;
      }

      .stoom-cookie-switch i::after{
        content:"" !important;
        position:absolute !important;
        top:3px !important;
        left:3px !important;
        width:16px !important;
        height:16px !important;
        border-radius:50% !important;
        background:#eaf8ff !important;
        transition:.2s !important;
      }

      .stoom-cookie-switch input:checked + i{
        border-color:#8eeaff !important;
        background:#55d4ff !important;
      }

      .stoom-cookie-switch input:checked + i::after{
        transform:translateX(18px) !important;
        background:#06131d !important;
      }

      .stoom-cookie-custom-actions{
        display:flex !important;
        gap:9px !important;
        margin:16px 0 0 !important;
        padding:0 !important;
      }

      .stoom-map-consent{
        min-height:inherit !important;
        height:100% !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        margin:0 !important;
        padding:28px !important;
        border:1px solid rgba(142,234,255,.22) !important;
        border-radius:inherit !important;
        background:radial-gradient(circle at 50% 0%,rgba(85,212,255,.14),transparent 55%),#071720 !important;
        color:#eaf8ff !important;
        text-align:center !important;
        font-family:Montserrat,Arial,sans-serif !important;
      }

      .stoom-map-consent-inner{max-width:350px !important}

      .stoom-map-consent small{
        display:block !important;
        margin:0 0 8px !important;
        color:#8eeaff !important;
        font-size:.60rem !important;
        font-weight:950 !important;
        letter-spacing:.1em !important;
        text-transform:uppercase !important;
      }

      .stoom-map-consent strong{
        display:block !important;
        margin:0 !important;
        color:#fff !important;
        font-family:Georgia,serif !important;
        font-size:1.65rem !important;
        font-weight:400 !important;
        line-height:1 !important;
      }

      .stoom-map-consent p{
        margin:10px 0 16px !important;
        color:#bfd4de !important;
        font-size:.77rem !important;
        font-weight:600 !important;
        line-height:1.6 !important;
      }

      .stoom-map-consent button{
        min-height:42px !important;
        margin:0 !important;
        padding:0 14px !important;
        border:0 !important;
        border-radius:12px !important;
        background:linear-gradient(135deg,#55d4ff,#8eeaff) !important;
        color:#06131d !important;
        font:inherit !important;
        font-size:.66rem !important;
        font-weight:900 !important;
        letter-spacing:.02em !important;
        text-transform:uppercase !important;
        cursor:pointer !important;
      }

      @media(max-width:980px){
        .stoom-footer-grid{
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
          gap:31px !important;
        }

        .stoom-footer-bottom{
          align-items:flex-start !important;
          flex-direction:column !important;
        }

        .stoom-footer-legal{
          justify-content:flex-start !important;
        }
      }

      @media(max-width:640px){
        .stoom-site-footer{
          padding-top:42px !important;
          padding-bottom:78px !important;
        }

        .stoom-footer-grid{
          grid-template-columns:1fr !important;
          gap:27px !important;
          padding-bottom:31px !important;
        }

        .stoom-footer-bottom{font-size:.62rem !important}

        .stoom-footer-legal{gap:7px 12px !important}

        .stoom-cookie-layer{
          right:10px !important;
          bottom:10px !important;
          left:10px !important;
        }

        .stoom-cookie-panel{
          padding:18px !important;
          border-radius:19px !important;
        }

        .stoom-cookie-actions,
        .stoom-cookie-custom-actions{
          display:grid !important;
          grid-template-columns:1fr !important;
        }

        .stoom-cookie-btn{width:100% !important}

        .stoom-cookie-choice{gap:12px !important}

        .stoom-cookie-choice strong{font-size:.74rem !important}

        .stoom-cookie-choice span{font-size:.68rem !important}
      }

      @media(prefers-reduced-motion:reduce){
        .stoom-cookie-switch i,
        .stoom-cookie-switch i::after{
          transition:none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function footerMarkup() {
    const year = new Date().getFullYear();

    return `
      <footer class="stoom-site-footer" aria-label="Pied de page">
        <div class="container stoom-footer-grid">

          <div class="stoom-footer-brand">
            <a class="stoom-footer-logo" href="index.html" aria-label="Retour à l'accueil STOOM">
              <div class="stoom-footer-mark" aria-hidden="true">S</div>
              <span class="stoom-footer-logo-copy">
                <strong>STOOM</strong>
                <small>Clermont-Ferrand</small>
              </span>
            </a>

            <p>Boutique spécialisée en cigarette électronique, e-liquides, matériel et conseils personnalisés à Clermont-Ferrand.</p>
            <span class="stoom-footer-adult">Produits de vapotage réservés aux majeurs</span>
          </div>

          <div class="stoom-footer-column" aria-label="Explorer">
            <span class="stoom-footer-title">Explorer</span>
            <ul class="stoom-footer-list">
              <li><a href="index.html">Catalogue</a></li>
              <li><a href="materiel.html">Matériel</a></li>
              <li><a href="diy.html">DIY</a></li>
              <li><a href="economies.html">Économies</a></li>
              <li><a href="concours.html">Concours</a></li>
              <li><a href="contact.html">Contact &amp; horaires</a></li>
            </ul>
          </div>

          <div class="stoom-footer-column" aria-label="Informations boutique">
            <span class="stoom-footer-title">La boutique</span>
            <address class="stoom-footer-address">
              109 B avenue Édouard Michelin<br>
              63100 Clermont-Ferrand
            </address>

            <div class="stoom-footer-contact">
              <a href="tel:0473273394">04 73 27 33 94</a>
              <a href="mailto:contactstoom63@gmail.com">contactstoom63@gmail.com</a>
              <a href="contact.html">Lun.–ven. 8h30–19h · Sam. 9h–19h</a>
            </div>
          </div>

          <div class="stoom-footer-column" aria-label="Réseaux et informations">
            <span class="stoom-footer-title">Suivre STOOM</span>
            <ul class="stoom-footer-list">
              <li><a href="https://www.instagram.com/stoomclermontferrand/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://www.google.com/search?q=STOOM+Cigarettes+%C3%A9lectronique+Clermont-Ferrand+avis" target="_blank" rel="noopener noreferrer">Avis Google</a></li>
              <li><a href="contact.html">Itinéraire &amp; horaires</a></li>
            </ul>
            <p class="stoom-footer-basalt">Site créé avec <b>BASALTE-WEB</b></p>
          </div>

        </div>

        <div class="container stoom-footer-bottom">
          <span>© ${year} STOOM · SAS au capital de 1 500 € · Pas de vente en ligne</span>

          <div class="stoom-footer-legal" aria-label="Informations légales">
            <a href="mentions-legales.html">Mentions légales</a>
            <a href="politique-confidentialite.html">Confidentialité</a>
            <a href="politique-cookies.html">Cookies</a>
            <a href="reglement-concours.html">Règlement concours</a>
            <button type="button" data-open-cookie-settings>Gérer mes cookies</button>
          </div>
        </div>
      </footer>
    `;
  }

  function injectFooter() {
    const existing = document.querySelector("footer");

    if (existing) {
      existing.outerHTML = footerMarkup();
    } else {
      document.body.insertAdjacentHTML("beforeend", footerMarkup());
    }
  }

  function repairLegalHeaderLogo() {
    document.querySelectorAll(".legal-mark").forEach(function (mark) {
      mark.style.setProperty("display", "flex", "important");
      mark.style.setProperty("align-items", "center", "important");
      mark.style.setProperty("justify-content", "center", "important");
      mark.style.setProperty("width", "42px", "important");
      mark.style.setProperty("height", "42px", "important");
      mark.style.setProperty("min-width", "42px", "important");
      mark.style.setProperty("min-height", "42px", "important");
      mark.style.setProperty("flex", "0 0 42px", "important");
      mark.style.setProperty("margin", "0", "important");
      mark.style.setProperty("padding", "0", "important");
      mark.style.setProperty("overflow", "visible", "important");
      mark.style.setProperty("line-height", "1", "important");
      mark.style.setProperty("font-size", "1.12rem", "important");
      mark.style.setProperty("letter-spacing", "0", "important");
      mark.style.setProperty("text-indent", "0", "important");
      mark.style.setProperty("text-align", "center", "important");
      mark.style.setProperty("text-transform", "none", "important");
    });
  }

  function loadTagManager() {
    if (!preferences.analytics) return;
    if (document.querySelector('script[data-stoom-gtm="true"]')) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.stoomGtm = "true";
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.gtmId);

    document.head.appendChild(script);
  }

  function mapPlaceholder(frame) {
    let placeholder = frame.nextElementSibling;

    if (!placeholder || !placeholder.classList.contains("stoom-map-consent")) {
      placeholder = document.createElement("div");
      placeholder.className = "stoom-map-consent";
      placeholder.innerHTML = `
        <div class="stoom-map-consent-inner">
          <small>Contenu externe</small>
          <strong>Google Maps</strong>
          <p>La carte est désactivée jusqu’à votre accord. Aucun contenu Google Maps ne sera chargé sans votre choix.</p>
          <button type="button">Afficher la carte</button>
        </div>
      `;

      frame.insertAdjacentElement("afterend", placeholder);

      placeholder.querySelector("button").addEventListener("click", function () {
        preferences.maps = true;
        saveConsent(preferences);
        applyPreferences();
      });
    }

    return placeholder;
  }

  function manageMaps() {
    document.querySelectorAll("iframe[data-stoom-map]").forEach(function (frame) {
      const source = frame.getAttribute("data-src");
      const placeholder = mapPlaceholder(frame);

      if (preferences.maps && source) {
        if (frame.getAttribute("src") !== source) {
          frame.setAttribute("src", source);
        }

        frame.hidden = false;
        placeholder.hidden = true;
      } else {
        frame.setAttribute("src", "about:blank");
        frame.hidden = true;
        placeholder.hidden = false;
      }
    });
  }

  function applyPreferences() {
    document.documentElement.dataset.stoomAnalytics = preferences.analytics ? "granted" : "denied";
    document.documentElement.dataset.stoomMaps = preferences.maps ? "granted" : "denied";

    manageMaps();
    loadTagManager();
  }

  function buildCookieLayer() {
    const previous = document.getElementById("stoomCookieLayer");
    if (previous) return previous;

    const layer = document.createElement("div");
    layer.className = "stoom-cookie-layer";
    layer.id = "stoomCookieLayer";
    layer.hidden = true;

    layer.innerHTML = `
      <div class="stoom-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="stoomCookieTitle">
        <div class="stoom-cookie-main">
          <span class="stoom-cookie-kicker">Votre confidentialité</span>
          <h2 id="stoomCookieTitle">Vos choix, simplement.</h2>
          <p>
            STOOM utilise des cookies nécessaires au fonctionnement du site.
            Les statistiques et Google Maps ne sont activés qu’avec votre accord.
            Consultez notre <a href="politique-cookies.html">politique cookies</a>.
          </p>

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
              <span>Autorise Google Tag Manager afin de mesurer l’utilisation du site.</span>
            </div>
            <label class="stoom-cookie-switch">
              <input type="checkbox" data-cookie-preference="analytics">
              <i></i><span>Autoriser</span>
            </label>
          </div>

          <div class="stoom-cookie-choice">
            <div>
              <strong>Contenu externe : Google Maps</strong>
              <span>Autorise l’affichage de la carte interactive sur les pages qui en proposent une.</span>
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
      </div>
    `;

    document.body.appendChild(layer);

    layer.querySelector('[data-cookie-action="accept"]').addEventListener("click", function () {
      preferences = { analytics: true, maps: true };
      saveConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    layer.querySelector('[data-cookie-action="reject"]').addEventListener("click", function () {
      preferences = { analytics: false, maps: false };
      saveConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    layer.querySelector('[data-cookie-action="customise"]').addEventListener("click", function () {
      layer.classList.add("is-customising");
      syncCookieForm();
    });

    layer.querySelector('[data-cookie-action="back"]').addEventListener("click", function () {
      layer.classList.remove("is-customising");
    });

    layer.querySelector('[data-cookie-action="save"]').addEventListener("click", function () {
      preferences = {
        analytics: layer.querySelector('[data-cookie-preference="analytics"]').checked,
        maps: layer.querySelector('[data-cookie-preference="maps"]').checked
      };

      saveConsent(preferences);
      applyPreferences();
      closeCookieLayer();
    });

    return layer;
  }

  function syncCookieForm() {
    const layer = buildCookieLayer();

    layer.querySelector('[data-cookie-preference="analytics"]').checked = preferences.analytics;
    layer.querySelector('[data-cookie-preference="maps"]').checked = preferences.maps;
  }

  function openCookieLayer(customise) {
    const layer = buildCookieLayer();

    syncCookieForm();
    layer.hidden = false;
    layer.classList.toggle("is-customising", customise === true);

    const target = customise
      ? layer.querySelector('[data-cookie-preference="analytics"]')
      : layer.querySelector('[data-cookie-action="accept"]');

    if (target) {
      window.setTimeout(function () {
        target.focus();
      }, 0);
    }
  }

  function closeCookieLayer() {
    const layer = document.getElementById("stoomCookieLayer");
    if (layer) layer.hidden = true;
  }

  function bindCookieButtons() {
    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-open-cookie-settings]");

      if (!trigger) return;

      event.preventDefault();
      openCookieLayer(true);
    });
  }

  function boot() {
    injectStyles();
    injectFooter();
    repairLegalHeaderLogo();
    bindCookieButtons();
    buildCookieLayer();
    applyPreferences();

    if (!readStoredConsent()) {
      openCookieLayer(false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.STOOMCookieConsent = {
    openPreferences: function () {
      openCookieLayer(true);
    },
    getPreferences: function () {
      return Object.assign({}, preferences);
    }
  };
})();

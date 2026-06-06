(function(){
  if(localStorage.getItem("stoom-age-ok") === "yes") return;

  const style = document.createElement("style");
  style.textContent = `
    .age-overlay{
      position:fixed;
      inset:0;
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:22px;
      background:
        radial-gradient(circle at top, rgba(53,185,238,.22), transparent 38%),
        rgba(3,10,16,.92);
      backdrop-filter:blur(14px);
    }

    .age-box{
      width:min(92vw,520px);
      border-radius:32px;
      padding:30px;
      background:linear-gradient(180deg, rgba(13,38,54,.96), rgba(6,19,29,.98));
      border:1px solid rgba(142,234,255,.28);
      box-shadow:0 30px 100px rgba(0,0,0,.55);
      text-align:center;
      color:#edf9ff;
      font-family:Montserrat, Arial, sans-serif;
    }

    .age-logo{
      width:70px;
      height:70px;
      margin:0 auto 18px;
      border-radius:24px;
      display:grid;
      place-items:center;
      background:linear-gradient(135deg,#35b9ee,#8eeaff);
      color:#06131d;
      font-weight:900;
      font-size:2rem;
      box-shadow:0 0 38px rgba(53,185,238,.35);
    }

    .age-box h2{
      margin:0 0 12px;
      color:white;
      text-transform:uppercase;
      font-size:clamp(1.7rem,5vw,2.7rem);
      line-height:.95;
      letter-spacing:-1px;
    }

    .age-box p{
      margin:0 auto 20px;
      max-width:420px;
      color:#c5e2ee;
      font-weight:650;
      line-height:1.6;
      font-size:.98rem;
    }

    .age-warning{
      margin:18px 0;
      padding:14px 16px;
      border-radius:18px;
      background:rgba(255,255,255,.07);
      border:1px solid rgba(142,234,255,.18);
      color:#d8f5ff;
      font-size:.84rem;
      font-weight:800;
      line-height:1.45;
    }

    .age-actions{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-top:20px;
    }

    .age-btn{
      min-height:52px;
      border:0;
      border-radius:999px;
      cursor:pointer;
      font-weight:900;
      text-transform:uppercase;
      font-size:.82rem;
      font-family:Montserrat, Arial, sans-serif;
    }

    .age-btn-ok{
      background:linear-gradient(135deg,#35b9ee,#8eeaff);
      color:#06131d;
      box-shadow:0 0 30px rgba(53,185,238,.25);
    }

    .age-btn-exit{
      background:rgba(255,255,255,.08);
      color:#fff;
      border:1px solid rgba(255,255,255,.16);
    }

    .age-small{
      margin-top:16px;
      color:#9ebdcc;
      font-size:.72rem;
      font-weight:700;
      line-height:1.4;
    }

    @media(max-width:480px){
      .age-box{padding:24px 20px;border-radius:26px}
      .age-actions{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "age-overlay";
  overlay.innerHTML = `
    <div class="age-box" role="dialog" aria-modal="true" aria-labelledby="ageTitle">
      <div class="age-logo">S</div>

      <h2 id="ageTitle">Bienvenue chez STOOM</h2>

      <p>
        Ce site présente des produits de vapotage réservés aux personnes majeures.
        Aucun achat en ligne n’est proposé.
      </p>

      <div class="age-warning">
        Pour continuer, confirmez que vous avez 18 ans ou plus.
      </div>

      <div class="age-actions">
        <button class="age-btn age-btn-ok" id="ageOk">J’ai 18 ans ou plus</button>
        <button class="age-btn age-btn-exit" id="ageExit">Quitter</button>
      </div>

      <div class="age-small">
        STOOM Clermont-Ferrand · Catalogue vitrine · Vente uniquement en boutique
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("ageOk").addEventListener("click", function(){
    localStorage.setItem("stoom-age-ok", "yes");
    overlay.remove();
  });

  document.getElementById("ageExit").addEventListener("click", function(){
    window.location.href = "https://www.google.fr";
  });
})();

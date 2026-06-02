
function escapeHtml(str){return String(str ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
async function loadJson(path,fallback=[]){try{const r=await fetch(path); if(!r.ok) return fallback; return await r.json()}catch(e){return fallback}}
function initCalc(){
  const cigs=document.getElementById('cigs'); if(!cigs)return;
  const v=document.getElementById('cigsValue'), m=document.getElementById('monthly'), y=document.getElementById('yearly'), five=document.getElementById('fiveyears');
  function up(){const n=Number(cigs.value), month=Math.round((n/20)*12.5*30), year=month*12; v.textContent=n; m.textContent=month.toLocaleString('fr-FR')+' €'; y.textContent=year.toLocaleString('fr-FR')+' €'; five.textContent=(year*5).toLocaleString('fr-FR')+' €';}
  cigs.addEventListener('input',up); up();
}
async function renderNews(limit){
  const el=document.getElementById('newsGrid'); if(!el)return;
  const items=await loadJson('data/nouveautes.json',[]);
  el.innerHTML=items.slice(0,limit||99).map((i,idx)=>`<article class="news-card ${idx===0?'big':''}"><div class="news-emoji">${escapeHtml(i.emoji||'✨')}</div><div class="news-content"><small>${escapeHtml(i.categorie||'Nouveauté')}</small><h3>${escapeHtml(i.titre)}</h3><p>${escapeHtml(i.description)}</p></div></article>`).join('');
}
async function renderContests(limit){
  const el=document.getElementById('contestList'); if(!el)return;
  const items=await loadJson('data/concours.json',[]);
  el.innerHTML=items.slice(0,limit||99).map(i=>`<article class="contest"><div class="date">${escapeHtml(i.jour||'??')}<span>${escapeHtml(i.mois||'date')}</span></div><div><h3>${escapeHtml(i.titre)}</h3><p>${escapeHtml(i.description)}</p></div><div class="label">${escapeHtml(i.statut||'À venir')}</div></article>`).join('');
}
initCalc(); renderNews(document.body.dataset.page==='home'?5:99); renderContests(document.body.dataset.page==='home'?3:99);


function initDiy(){
  const volume=document.getElementById('diyVolume');
  if(!volume) return;
  const nicotine=document.getElementById('diyNicotine');
  const aroma=document.getElementById('diyAroma');
  const booster=document.getElementById('diyBooster');
  const outBoosters=document.getElementById('outBoosters');
  const outAroma=document.getElementById('outAroma');
  const outBase=document.getElementById('outBase');
  const outSummary=document.getElementById('outSummary');
  function calc(){
    const V=Number(volume.value);
    const target=Number(nicotine.value);
    const aromaPct=Number(aroma.value);
    const boosterStrength=Number(booster.value);
    const boosterMl = target > 0 ? (target * V) / boosterStrength : 0;
    const aromaMl = V * aromaPct / 100;
    const baseMl = Math.max(0, V - boosterMl - aromaMl);
    const boosters10 = Math.ceil(boosterMl / 10);
    outBoosters.textContent = boosterMl.toFixed(1).replace('.', ',') + ' ml' + (target>0 ? ' ≈ ' + boosters10 + ' booster(s)' : '');
    outAroma.textContent = aromaMl.toFixed(1).replace('.', ',') + ' ml';
    outBase.textContent = baseMl.toFixed(1).replace('.', ',') + ' ml';
    outSummary.textContent = V + ' ml en ' + target + ' mg/ml avec ' + aromaPct + '% d’arôme';
  }
  [volume,nicotine,aroma,booster].forEach(e=>e.addEventListener('input',calc));
  calc();
}
initDiy();

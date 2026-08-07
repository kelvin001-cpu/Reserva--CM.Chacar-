// GEO and Reservations module
const geoModule = (function(){
  async function init(){ renderGeoGrid(); }
  async function renderGeoGrid(){ const grid = document.getElementById('gemeo-grid'); if(!grid) return; grid.innerHTML=''; let seed = [];
    try{ const resp = await fetch('src/geo-seed.json'); seed = await resp.json(); }catch(e){ seed = JSON.parse(localStorage.getItem('geo_seed')||'[]'); }
    if(seed.length===0) { grid.innerHTML='<div class="info-box">Nenhum espaço cadastrado.</div>'; return; }
    seed.forEach(s=>{ const d = document.createElement('div'); d.className='gemeo-room '+(Math.random()>0.7?'ocupado':'disponivel'); d.innerHTML = `<i class="fa fa-door-closed"></i><div style="font-size:13px">${s.name}</div><div style="font-size:11px;color:var(--text-muted)">${s.floor} • ${s.segment}</div>`; d.addEventListener('click', ()=> showSpaceModal(s)); grid.appendChild(d); });
  }
  function showSpaceModal(s){ alert(s.name+'\n\nAndar: '+s.floor+'\nSegmento: '+s.segment); }
  return { init, renderGeoGrid };
})();
window.gemeoModule = geoModule;

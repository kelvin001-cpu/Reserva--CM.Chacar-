// Simple calendar and events
const calendario = (function(){
  const now = new Date(); let month = now.getMonth(); let year = now.getFullYear();
  function anterior(){ month--; if(month<0){ month=11; year--; } render(); }
  function proximo(){ month++; if(month>11){ month=0; year++; } render(); }
  function addEvento(){ const title = document.getElementById('evento-titulo').value.trim(); const date = document.getElementById('evento-data').value; if(!title||!date) return alert('Preencha título e data'); const ev = { id:'ev_'+Date.now(), title, date, createdBy: auth.getCurrentUser()?auth.getCurrentUser().prontuario:'anon' }; const arr = JSON.parse(localStorage.getItem('eventos')||'[]'); arr.push(ev); localStorage.setItem('eventos', JSON.stringify(arr)); document.getElementById('evento-titulo').value=''; render(); }
  function render(){ const firstDay = new Date(year, month, 1); const startWeek = firstDay.getDay(); const daysInMonth = new Date(year, month+1, 0).getDate(); document.getElementById('cal-mes-ano').textContent = firstDay.toLocaleString('pt-BR', { month:'long', year:'numeric' }); const grid = document.getElementById('cal-grid'); grid.innerHTML=''; for(let i=0;i<startWeek;i++){ const el = document.createElement('div'); el.className='cal-day'; el.innerHTML=''; grid.appendChild(el); }
    for(let d=1; d<=daysInMonth; d++){ const el = document.createElement('div'); el.className='cal-day'; el.textContent=d; const dateStr = new Date(year,month,d).toISOString().slice(0,10); const events = (JSON.parse(localStorage.getItem('eventos')||'[]')).filter(e=> e.date===dateStr); if(events.length>0){ el.classList.add('has-event'); el.title = events.map(x=>x.title).join('\n'); }
      el.addEventListener('click', ()=> showDay(dateStr)); grid.appendChild(el); }
    // list events
    const list = document.getElementById('lista-eventos'); list.innerHTML=''; const arr = JSON.parse(localStorage.getItem('eventos')||'[]'); arr.forEach(ev=>{ const div = document.createElement('div'); div.style.fontSize='12px'; div.textContent = ev.date+' — '+ev.title; list.appendChild(div); }); }
  function showDay(dateStr){ const arr = JSON.parse(localStorage.getItem('eventos')||'[]').filter(e=> e.date===dateStr); if(arr.length===0) alert('Nenhum evento'); else alert(arr.map(e=>e.title).join('\n')) }
  return { anterior, proximo, addEvento, render, init: render };
})();
window.calendario = calendario;

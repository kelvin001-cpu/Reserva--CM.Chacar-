// Notifications simple list
const notifications = (function(){
  function list(){ return JSON.parse(localStorage.getItem('notifications')||'[]'); }
  function render(){ const el = document.getElementById('dashboard-alertas-container'); if(!el) return; const arr = list(); if(arr.length===0) { el.innerHTML = '<div class="info-box">Nenhuma notificação.</div>'; return; } el.innerHTML = arr.slice().reverse().map(n=> `<div class="alert-box">${n.text} <div style="font-size:11px; color:var(--text-muted)">${new Date(n.ts).toLocaleString()}</div></div>`).join(''); }
  return { list, render };
})();
window.notifications = notifications;

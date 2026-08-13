// Inject session script and logout handler into index.html
(function(){
  if(!document) return;
  // add script tag for session-features.js if not present
  if(!document.querySelector('script[src="session-features.js"]')){
    const s = document.createElement('script'); s.src='session-features.js'; s.defer=true; document.body.appendChild(s);
  }

  function logout(){
    try{ localStorage.removeItem(window.app?._sessionKey||'conect_session_v1'); localStorage.removeItem('conect_avatar'); }catch(e){}
    location.reload();
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    const b = document.getElementById('logout-btn'); if(b){ b.addEventListener('click', logout); }
  });
})();

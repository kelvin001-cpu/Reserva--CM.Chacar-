// UI initialization: attach event listeners and init modules
document.addEventListener('DOMContentLoaded', async ()=>{
  // enforce data-perm initially
  if(window.perm) await perm.init();
  if(window.perm) perm.enforceUI();

  // wire topbar search fallback
  window.globalSearch = {
    query(q){
      const dd = document.getElementById('search-dropdown');
      if(!dd) return;
      if(!q) { dd.style.display='none'; dd.innerHTML=''; return; }
      dd.style.display='block';
      dd.innerHTML = '<div class="search-result-item">Pesquisa não implementada em modo offline</div>';
    }
  };

  // init modules if present
  const toInit = ['editais','pedagogico','comunicacao','alunos','gemeo','operacional'];
  toInit.forEach(k=>{ const mod = window[k+'Module']; if(mod && typeof mod.init==='function') try{ mod.init(); }catch(e){} });

  // setup quick login test buttons if present
  // expose admin-permissions open button
  const adminBtn = document.createElement('button');
  adminBtn.className='topbar-btn ntei-only';
  adminBtn.textContent='Permissões';
  adminBtn.onclick = ()=> window.adminPermissions && window.adminPermissions.open();
  const nav = document.getElementById('topbar-nav');
  if(nav) nav.appendChild(adminBtn);

  // setup logout button behavior already present
});

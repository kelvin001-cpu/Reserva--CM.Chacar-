// modules controller: show/hide module views and enforce permissions
window.modules = (function(){
  const views = {};
  function show(name){
    // hide all
    document.querySelectorAll('.module-view').forEach(el=> el.classList.remove('active'));
    const id = 'mod-'+name;
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    // update topbar active
    document.querySelectorAll('.topbar-btn').forEach(b=> b.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.topbar-btn')).find(b=> b.getAttribute('onclick') && b.getAttribute('onclick').includes("modules.show('"+name+"')"));
    if(btn) btn.classList.add('active');
    // enforce perms for UI elements
    if(window.perm) perm.enforceUI(document.getElementById(id));
    // module init hook
    if(window[name+'Module'] && typeof window[name+'Module'].init === 'function'){
      try{ window[name+'Module'].init(); }catch(e){ console.error('module init error', name, e); }
    }
  }
  return { show };
})();

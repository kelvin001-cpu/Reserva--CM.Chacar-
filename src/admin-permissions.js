// src/admin-permissions.js
// Minimal admin UI to manage user permissions. It appends a floating button that opens a modal.

(function(){
  function createButton(){
    const btn = document.createElement('button');
    btn.id = 'ntei-admin-open';
    btn.textContent = 'Admin Acessos';
    btn.style.position = 'fixed';
    btn.style.right = '18px';
    btn.style.bottom = '18px';
    btn.style.zIndex = 99999;
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.background = 'linear-gradient(90deg,#00adef,#0078c1)';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
  }

  function openModal(){
    if(document.getElementById('ntei-admin-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'ntei-admin-modal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 100000;

    const panel = document.createElement('div');
    panel.style.width = '720px';
    panel.style.maxWidth = '96%';
    panel.style.maxHeight = '86%';
    panel.style.overflow = 'auto';
    panel.style.background = 'linear-gradient(180deg,#0d1117,#0b0f14)';
    panel.style.border = '1px solid rgba(255,255,255,0.06)';
    panel.style.padding = '14px';
    panel.style.borderRadius = '10px';
    panel.style.color = '#fff';

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
        <h3 style="margin:0">Gerenciamento de Acessos — NTEi</h3>
        <button id="ntei-admin-close" style="background:transparent;border:1px solid rgba(255,255,255,0.06);color:#fff;padding:6px 8px;border-radius:6px;">Fechar</button>
      </div>
      <div style="display:flex; gap:8px; margin-bottom:10px">
        <input id="ntei-search-pront" placeholder="Prontuário (ex: 46690)" style="flex:1;padding:8px;border-radius:6px;border:1px solid #333;background:rgba(255,255,255,0.02);color:#fff">
        <button id="ntei-search-btn" style="padding:8px;background:#00adef;color:#000;border-radius:6px;border:none">Buscar</button>
      </div>
      <div id="ntei-search-result">Insira um prontuário e clique Buscar.</div>
    `;

    modal.appendChild(panel);
    document.body.appendChild(modal);

    modal.querySelector('#ntei-admin-close').addEventListener('click', ()=> modal.remove());
    modal.querySelector('#ntei-search-btn').addEventListener('click', onSearch);
  }

  async function onSearch(){
    const val = document.getElementById('ntei-search-pront').value.trim();
    const res = document.getElementById('ntei-search-result');
    if(!val){ res.innerHTML = '<div style="color:#f1c40f">Digite um prontuário.</div>'; return; }
    res.innerHTML = '<div style="color:#8b949e">Buscando...</div>';
    await perm.init();
    const user = await perm.loadUser(val);
    if(!user){
      res.innerHTML = `<div style="color:#e74c3c">Usuário ${val} não encontrado.</div>`;
      return;
    }
    renderUser(res, user);
  }

  function renderUser(container, user){
    container.innerHTML = '';
    const header = document.createElement('div');
    header.style.display = 'flex'; header.style.justifyContent = 'space-between'; header.style.alignItems = 'center';
    header.innerHTML = `<div>
      <div style="font-weight:700">${user.name||'—'}</div>
      <div style="font-size:12px;color:#8b949e">Prontuário: ${user.prontuario || '—'} · Cargo: ${user.roleId || '—'}</div>
    </div>`;
    container.appendChild(header);

    const status = document.createElement('div');
    status.style.marginTop = '8px';
    status.innerHTML = `<b>Status:</b> ${statusLabel(user.status)}`;
    container.appendChild(status);

    // permissions list
    const permWrap = document.createElement('div');
    permWrap.style.marginTop = '12px';
    permWrap.innerHTML = '<div style="font-weight:700;margin-bottom:8px">Permissões</div>';

    const list = document.createElement('div');
    const keys = Object.keys((user.permissions)||{}).sort();
    if(keys.length===0){ list.innerHTML = '<div style="color:#8b949e">Nenhuma permissão explícita encontrada.</div>'; }
    keys.forEach(k=>{
      const row = document.createElement('div');
      row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='6px 0';
      row.innerHTML = `<div style="font-size:13px">${k}</div>`;
      const s = document.createElement('input'); s.type='checkbox'; s.checked = !!user.permissions[k];
      s.addEventListener('change', async ()=>{
        await perm.setPermission(user.prontuario, k, s.checked);
        s.disabled = true; s.style.opacity = 0.6; setTimeout(()=> s.disabled=false, 600);
      });
      row.appendChild(s);
      list.appendChild(row);
    });

    permWrap.appendChild(list);
    container.appendChild(permWrap);

    // quick add permission
    const addBox = document.createElement('div'); addBox.style.marginTop='12px';
    addBox.innerHTML = '<input id="ntei-add-perm" placeholder="nova.permissao.ex: view:mod_pedagogico" style="width:70%;padding:8px;border-radius:6px;border:1px solid #333;background:rgba(255,255,255,0.02);color:#fff"> <button id="ntei-add-perm-btn" style="padding:8px;background:#2ecc71;color:#000;border-radius:6px;border:none">Adicionar</button>';
    container.appendChild(addBox);
    addBox.querySelector('#ntei-add-perm-btn').addEventListener('click', async ()=>{
      const key = document.getElementById('ntei-add-perm').value.trim();
      if(!key) return;
      await perm.setPermission(user.prontuario, key, true);
      onSearch();
    });
  }

  function statusLabel(s){
    if(!s) return '—';
    if(s==='ativo') return '🟢 Ativo';
    if(s==='pendente') return '🟡 Pendente';
    if(s==='bloqueado') return '🔴 Bloqueado';
    if(s==='ntei') return '🔵 NTEi';
    return s;
  }

  // Initialize floating button only if current user is NTEi (or in local dev)
  async function init(){
    await perm.init();
    const u = perm._state.currentUser;
    if(u && (u.status==='ntei' || (u.roleId && perm._state.roles[u.roleId] && perm._state.roles[u.roleId].isAdmin))){
      createButton();
    } else {
      // in dev mode allow opening with keyboard: Ctrl+Shift+A
      document.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='a') openModal(); });
    }
  }

  // automatic init deferred
  if(document.readyState==='complete' || document.readyState==='interactive') setTimeout(init,300);
  else document.addEventListener('DOMContentLoaded', init);
})();

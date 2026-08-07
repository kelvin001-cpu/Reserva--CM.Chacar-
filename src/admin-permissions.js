// Minimal admin permissions UI - creates a modal to search and edit user permissions
(function(){
  function createModal(){
    if(document.getElementById('admin-perm-modal')) return;
    const div = document.createElement('div');
    div.id = 'admin-perm-modal';
    div.style= 'position:fixed; inset:0; background:rgba(0,0,0,0.7); display:none; align-items:center; justify-content:center; z-index:200000;';
    div.innerHTML = `
      <div style="background:#0d1117; border:1px solid rgba(0,173,239,0.2); padding:18px; width:520px; border-radius:10px;">
        <h3 style="margin:0 0 8px 0; font-family:Orbitron">Gerenciamento de Acessos — NTEi</h3>
        <div style="display:flex; gap:8px; margin-bottom:8px">
          <input id="admperm-pront" placeholder="Prontuário" style="flex:0 0 140px; padding:8px;">
          <button id="admperm-search" class="btn" style="background:var(--prof); padding:8px">Buscar</button>
          <button id="admperm-close" class="btn" style="background:rgba(255,255,255,0.08); padding:8px">Fechar</button>
        </div>
        <div id="admperm-info" style="font-size:13px; color:var(--text-muted)"></div>
        <div style="margin-top:10px">
          <textarea id="admperm-json" style="width:100%; height:160px; background:#071017; color:#fff; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);"></textarea>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px">
          <button id="admperm-save" class="btn" style="background:var(--cad); color:#000">Salvar Permissões</button>
        </div>
        <div id="admperm-status" style="font-size:12px; color:var(--text-muted); margin-top:8px"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById('admperm-close').addEventListener('click', ()=>{ div.style.display='none'; });
    document.getElementById('admperm-search').addEventListener('click', async ()=>{
      const p = document.getElementById('admperm-pront').value.trim();
      if(!p) return;
      const u = await (window.perm && perm.getUser ? perm.getUser(p) : Promise.resolve(null));
      document.getElementById('admperm-info').textContent = u ? (u.name||u.prontuario) : 'Usuário não encontrado.';
      document.getElementById('admperm-json').value = u && u.permissions ? JSON.stringify(u.permissions, null, 2) : '{}';
    });
    document.getElementById('admperm-save').addEventListener('click', async ()=>{
      const p = document.getElementById('admperm-pront').value.trim();
      if(!p) return alert('Informe prontuário');
      let perms = {};
      try{ perms = JSON.parse(document.getElementById('admperm-json').value || '{}'); }catch(e){ return alert('JSON inválido'); }
      await perm.setUserPermissions(p, perms);
      document.getElementById('admperm-status').textContent = 'Permissões atualizadas.';
      await audit.log('perm_update', (auth.getCurrentUser && auth.getCurrentUser().prontuario) || 'system', p, { permissions: perms });
    });
  }
  window.adminPermissions = { open: function(){ createModal(); document.getElementById('admin-perm-modal').style.display='flex'; } };
})();

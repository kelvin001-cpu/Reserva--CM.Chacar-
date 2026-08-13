// session-features.js
// Implements session persistence, avatar persistence, notification listeners and UI helpers.

(function(){
  // small guard
  if(!window.app || !window.db) return console.warn('session-features: missing app or db');
  const app = window.app;
  const db = window.db;

  app._sessionKey = 'conect_session_v1';

  app._applyUserToUI = function(user){
    if(!user) return;
    const tn = document.getElementById('topbar-username');
    if(tn) tn.textContent = user.nome || user.nomeCadastro || 'Usuário';

    const avatarEl = document.getElementById('topbar-avatar');
    const fallback = document.getElementById('topbar-avatar-fallback');
    const avatarUrl = user.avatar || localStorage.getItem('conect_avatar') || null;
    if(avatarUrl && avatarEl){
      avatarEl.src = avatarUrl; avatarEl.classList.remove('hidden'); if(fallback) fallback.classList.add('hidden');
    } else { if(avatarEl) avatarEl.classList.add('hidden'); if(fallback) fallback.classList.remove('hidden'); }

    try{ if(window.Permissions) Permissions.init(app.user); } catch(e){ console.warn(e); }
  };

  app._saveSession = function(userObj){
    try{
      const safe = { pront: userObj.pront, nome: userObj.nome, cargo: userObj.cargo, avatar: userObj.avatar||null, lastSeen: new Date().toISOString() };
      localStorage.setItem(app._sessionKey, JSON.stringify(safe));
      if(db && safe.pront) db.ref('usuarios/'+safe.pront+'/lastSession').set({ at: safe.lastSeen, nome: safe.nome }).catch(()=>{});
    }catch(e){ console.error('Erro ao salvar sessão', e); }
  };

  app.restoreSession = async function(){
    try{
      const raw = localStorage.getItem(app._sessionKey); if(!raw) return false;
      const s = JSON.parse(raw); if(!s||!s.pront) return false;
      const snap = await db.ref('usuarios/'+s.pront).once('value');
      if(snap.exists()){
        const userData = snap.val(); userData.avatar = userData.avatar || s.avatar || localStorage.getItem('conect_avatar') || null;
        app.user = Object.assign({}, userData, {pront: s.pront, nome: userData.nome||s.nome});
        if(typeof app.start === 'function') try{ app.start(); } catch(e){ console.warn('app.start error', e); }
        app._applyUserToUI(app.user);
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('main-system')?.classList.remove('hidden');
        return true;
      } else { localStorage.removeItem(app._sessionKey); return false; }
    }catch(e){ console.error('restoreSession', e); return false; }
  };

  // perfilFoto helpers
  window.perfilFoto = window.perfilFoto || {};
  perfilFoto._applyToUI = function(url){
    const avatarEl = document.getElementById('topbar-avatar'); const fallback = document.getElementById('topbar-avatar-fallback');
    if(avatarEl){ avatarEl.src = url; avatarEl.classList.remove('hidden'); if(fallback) fallback.classList.add('hidden'); }
    if(app.user){ app.user.avatar = url; app._saveSession(app.user); }
  };
  perfilFoto.salvar = perfilFoto.salvar || async function(){
    try{
      const fileEl = document.getElementById('pf-file'); const linkEl = document.getElementById('pf-link');
      if(linkEl && linkEl.value){ const url = linkEl.value.trim(); if(app.user && app.user.pront) await db.ref('usuarios/'+app.user.pront+'/avatar').set(url); localStorage.setItem('conect_avatar', url); perfilFoto._applyToUI(url); perfilFoto.fechar(); return; }
      if(fileEl && fileEl.files && fileEl.files[0]){
        const f = fileEl.files[0]; const reader = new FileReader(); reader.onload = async function(evt){ const base64=evt.target.result; if(app.user && app.user.pront) await db.ref('usuarios/'+app.user.pront+'/avatar').set(base64); localStorage.setItem('conect_avatar', base64); perfilFoto._applyToUI(base64); perfilFoto.fechar(); };
        reader.readAsDataURL(f); return;
      }
      document.getElementById('pf-status').textContent = 'Escolha um arquivo ou cole um link.';
    }catch(e){ console.error(e); document.getElementById('pf-status').textContent='Erro ao salvar foto.'; }
  };

  // notifications
  const notify = { _badgeEl: document.getElementById('badge-count'), showToast(t){ const el=document.createElement('div'); el.className='toast animate-in'; el.innerHTML=`<span class="sender">${t.title}</span><span>${t.text}</span>`; document.body.appendChild(el); setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>el.remove(),400); }, t.timeout||6000); }, setBadge(n){ if(!this._badgeEl) this._badgeEl=document.getElementById('badge-count'); if(!this._badgeEl) return; if(n>0){ this._badgeEl.style.display='flex'; this._badgeEl.textContent=n; } else { this._badgeEl.style.display='none'; this._badgeEl.textContent='0'; } } };

  app._localUnread = 0;
  app._incrementUnread = function(by=1){ app._localUnread=(app._localUnread||0)+by; notify.setBadge(app._localUnread); };

  app._startNotificationListeners = function(){
    if(!db||!app.user||!app.user.pront) return;

    // mensagens
    db.ref('mensagens').limitToLast(50).on('child_added', snap=>{
      const m=snap.val(); if(!m) return; if(String(m.fromPront)===String(app.user.pront)) return;
      notify.showToast({ title: m.fromName||'Mensagem', text: m.text||'Nova mensagem' }); app._incrementUnread(1);
      const seen = JSON.parse(localStorage.getItem('conect_seen_msgs')||'[]'); if(!seen.includes(snap.key)){ seen.push(snap.key); localStorage.setItem('conect_seen_msgs', JSON.stringify(seen)); }
    });

    // chamados
    db.ref('chamados').orderByChild('createdAt').limitToLast(20).on('child_added', snap=>{
      const c=snap.val(); if(!c) return; if(String(c.openedByPront)===String(app.user.pront)) return;
      notify.showToast({ title: 'Chamado', text: `${c.titulo||'Novo chamado'}` }); app._incrementUnread(1);
    });

    // notificacoes por usuário
    db.ref('notificacoes/'+app.user.pront).on('child_added', sn=>{ const n=sn.val(); if(!n) return; notify.showToast({ title: n.tipo||'Aviso', text: n.texto||'Você tem uma notificação' }); app._incrementUnread(1); });
  };

  // clear unread when opening communication
  document.querySelectorAll('[onclick*="modules.show(\'comunicacao\')"]').forEach(btn=>btn.addEventListener('click', ()=>{ app._localUnread=0; notify.setBadge(0); }));

  // inject cadastro symbol if not present
  (function injectCadastroSymbol(){
    if(document.getElementById('cadastro-symbol')) return;
    // try find the cadastro sector column by searching for button text
    const sectors = Array.from(document.querySelectorAll('.sector-column'));
    for(const s of sectors){ if(s.textContent && s.textContent.toLowerCase().includes('cadastro')){
        const symbol = document.createElement('span'); symbol.id='cadastro-symbol'; symbol.title='Novos cadastros'; symbol.style.cssText='display:none;margin-left:8px;background:var(--gestao);width:12px;height:12px;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.3)';
        const header = s.querySelector('h2') || s.firstChild; header && header.parentNode && header.parentNode.insertBefore(symbol, header.nextSibling);
        break;
    }}
  })();

  // auto restore on load
  window.addEventListener('load', async ()=>{ const restored = await app.restoreSession(); if(restored) app._startNotificationListeners(); });

  // export to window for debugging
  window._sessionFeatures = { restoreSession: app.restoreSession, saveSession: app._saveSession };
})();

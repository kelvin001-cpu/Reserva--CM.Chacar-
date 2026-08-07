// Chat module: mural and P2P
const comunicacaoModule = (function(){
  async function init(){ renderMural(); renderP2PList(); }
  async function sendMural(){
    const txt = document.getElementById('chat-in').value.trim(); if(!txt) return;
    const me = auth.getCurrentUser();
    const msg = { from: me?me.prontuario:'anon', text: txt, ts: new Date().toISOString() };
    if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const ref = firebase.database().ref('/mural').push(); await ref.set(msg); }
    else{ const arr = JSON.parse(localStorage.getItem('mural')||'[]'); arr.push(msg); localStorage.setItem('mural', JSON.stringify(arr)); }
    document.getElementById('chat-in').value=''; renderMural(); notify('novo_mural', 'Novo aviso no mural');
  }
  async function renderMural(){ const box = document.getElementById('chat-box'); if(!box) return; box.innerHTML=''; let msgs = [];
    if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/mural').once('value'); const obj = snap.val()||{}; msgs = Object.keys(obj).map(k=>obj[k]); }
    else msgs = JSON.parse(localStorage.getItem('mural')||'[]');
    if(msgs.length===0) { box.innerHTML='<div class="info-box">Nenhuma mensagem no mural.</div>'; return; }
    msgs.slice().reverse().forEach(m=>{ const div = document.createElement('div'); div.className='msg msg-in'; div.innerHTML = `<b>${escapeName(m.from)}</b> <span style="font-size:11px; color:var(--text-muted); margin-left:6px;">${new Date(m.ts).toLocaleString()}</span><div style="margin-top:6px">${escapeHtml(m.text)}</div>`; box.appendChild(div); });
  }
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function escapeName(id){ if(!id) return '—'; try{ const users = JSON.parse(localStorage.getItem('perm_users')||'{}'); const u = users[id]; if(u && u.name) return u.name; }catch(e){} return id; }

  // P2P
  async function initP2PList(){ renderP2PUsers(); }
  async function renderP2PUsers(){ const sel = document.getElementById('p2p-target-user'); if(!sel) return; sel.innerHTML='<option value="">Selecione alguém para conversar...</option>'; const users = await loadUsers(); for(const id in users){ const opt = document.createElement('option'); opt.value=id; opt.textContent = users[id].name || id; sel.appendChild(opt); } }
  async function initP2PChat(){ const target = document.getElementById('p2p-target-user').value; renderP2PChat(target); }
  async function renderP2PChat(target){ const box = document.getElementById('p2p-chat-box'); if(!box) return; box.innerHTML=''; if(!target) return; const conv = await loadConversation(target); if(conv.length===0) { box.innerHTML='<div class="info-box">Nenhuma mensagem.</div>'; return; } conv.forEach(m=>{ const div = document.createElement('div'); div.className = (m.from===auth.getCurrentUser().prontuario)? 'msg msg-out':'msg msg-in'; div.innerHTML = `<div style="font-size:12px">${escapeHtml(m.text)}<div style="font-size:10px; color:var(--text-muted)">${new Date(m.ts).toLocaleString()}</div></div>`; box.appendChild(div); }); box.scrollTop = box.scrollHeight; }
  async function sendP2PMessage(){ const target = document.getElementById('p2p-target-user').value; const text = document.getElementById('p2p-chat-in').value.trim(); if(!target || !text) return alert('Selecione usuário e escreva mensagem'); const me = auth.getCurrentUser(); const msg = { from: me?me.prontuario:'anon', to: target, text, ts: new Date().toISOString() };
    if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const ref = firebase.database().ref('/chats').push(); await ref.set(msg); }
    else{ const arr = JSON.parse(localStorage.getItem('chats')||'[]'); arr.push(msg); localStorage.setItem('chats', JSON.stringify(arr)); }
    document.getElementById('p2p-chat-in').value=''; renderP2PChat(target); notify('nova_mensagem', 'Nova mensagem privada');
  }

  async function loadUsers(){ if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/users').once('value'); return snap.val()||{} }else return JSON.parse(localStorage.getItem('perm_users')||'{}'); }
  async function loadConversation(target){ if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/chats').orderByChild('to').equalTo(target).once('value'); const obj = snap.val()||{}; return Object.keys(obj).map(k=>obj[k]); }else{ const arr = JSON.parse(localStorage.getItem('chats')||'[]'); return arr.filter(m=> m.to===target || m.from===target); } }

  function notify(type, text){ const bc = document.getElementById('badge-count'); if(bc){ bc.style.display='inline-flex'; bc.textContent = (parseInt(bc.textContent||'0')+1).toString(); }
    // persist notifications
    const arr = JSON.parse(localStorage.getItem('notifications')||'[]'); arr.push({ type, text, ts: new Date().toISOString() }); localStorage.setItem('notifications', JSON.stringify(arr)); }

  return { init, sendMural, initP2PList, initP2PChat, sendP2PMessage };
})();
window.comunicacaoModule = comunicacaoModule;

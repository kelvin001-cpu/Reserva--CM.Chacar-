// Tickets module
const ticketsModule = (function(){
  async function init(){ renderTicketsList(); }
  async function abrirChamado(){
    const tipo = document.getElementById('chamado-tipo').value; const desc = document.getElementById('chamado-desc').value.trim(); if(!tipo || !desc) return alert('Preencha categoria e descrição');
    const me = auth.getCurrentUser();
    const ticket = { id: 'T-'+String(Date.now()).slice(-6), user: me?me.prontuario:'anon', tipo, desc, status:'Aberto', createdAt:new Date().toISOString(), history:[] };
    if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const ref = firebase.database().ref('/tickets').push(); await ref.set(ticket); await audit.log('ticket_create', me?me.prontuario:'unknown', ref.key, ticket); }
    else{ const arr = JSON.parse(localStorage.getItem('tickets')||'[]'); arr.push(ticket); localStorage.setItem('tickets', JSON.stringify(arr)); await audit.log('ticket_create', me?me.prontuario:'unknown', ticket.id, ticket); }
    alert('Chamado criado com sucesso — Ticket '+ticket.id);
    document.getElementById('chamado-desc').value=''; renderTicketsList(); }
  async function listar(){ if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/tickets').once('value'); const obj = snap.val()||{}; return Object.keys(obj).map(k=>Object.assign({ id:k }, obj[k])); }else return JSON.parse(localStorage.getItem('tickets')||'[]'); }
  async function renderTicketsList(){ const box = document.getElementById('lista-chamados-nti'); if(!box) return; box.innerHTML=''; const items = await listar(); if(!items || items.length===0){ box.innerHTML='<div class="info-box">Nenhum chamado aberto.</div>'; return; } items.slice().reverse().forEach(t=>{ const div = document.createElement('div'); div.className='res-card-agenda'; div.innerHTML = `<b>${t.id}</b> <span style="float:right; font-size:11px">${t.status}</span><div style="font-size:12px">${t.tipo} — ${t.desc}</div><div style="margin-top:8px"><button class="btn" style="width:auto; padding:6px; background:var(--prof)" onclick="ticketsModule.openTicket('${t.id}')">Abrir</button></div>`; box.appendChild(div); }); }
  async function openTicket(id){ // show detail and chat area
    // find ticket
    let t = null; if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/tickets').orderByKey().equalTo(id).once('value'); const obj = snap.val()||{}; t = Object.values(obj)[0]; }else{ const arr = JSON.parse(localStorage.getItem('tickets')||'[]'); t = arr.find(x=> x.id===id); }
    if(!t) return alert('Ticket não encontrado'); document.getElementById('active-ticket-area').classList.remove('hidden'); document.getElementById('chat-nti-box').innerHTML = `<div style="font-size:13px"><b>Ticket ${t.id}</b><div style="margin-top:8px">${t.desc}</div></div>`; document.getElementById('chat-nti-in').value=''; }
  async function sendChatNTEi(){ const txt = document.getElementById('chat-nti-in').value.trim(); if(!txt) return; const box = document.getElementById('chat-nti-box'); const me = auth.getCurrentUser(); const msg = { from: me?me.prontuario:'anon', text: txt, ts: new Date().toISOString() }; // append to temporary chat
    const arr = JSON.parse(localStorage.getItem('chat_nti')||'[]'); arr.push(msg); localStorage.setItem('chat_nti', JSON.stringify(arr)); box.innerHTML += `<div class="msg msg-out">${txt}</div>`; document.getElementById('chat-nti-in').value=''; }
  async function finalizarChamado(){ document.getElementById('active-ticket-area').classList.add('hidden'); alert('Atendimento encerrado.'); }
  return { init, abrirChamado, renderTicketsList, openTicket, sendChatNTEi, finalizarChamado };
})();
window.ticketsModule = ticketsModule;

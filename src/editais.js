// Editais module: CRUD with permission checks and audit
const editais = (function(){
  const listElId = 'ed-lista';

  async function init(){
    if(window.FIREBASE_CONFIG && window.firebase){
      if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    renderLista();
  }

  async function publicar(){
    // collect form
    const titulo = document.getElementById('ed-titulo').value.trim();
    const numero = document.getElementById('ed-numero').value.trim();
    const categoria = document.getElementById('ed-categoria').value;
    const descricao = document.getElementById('ed-descricao').value.trim();
    const prazo = document.getElementById('ed-prazo').value;
    if(!titulo) return alert('Título obrigatório');
    const me = auth.getCurrentUser();
    const allowed = await perm.canAction('editais:create');
    if(!allowed) return alert('Acesso negado: publicar editais');
    const payload = { titulo, numero, categoria, descricao, prazo, publishedBy: me?me.prontuario:null, publishedAt: new Date().toISOString(), status:'Aberto' };
    try{
      if(window.firebase && window.FIREBASE_CONFIG){
        if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
        const ref = firebase.database().ref('/editais').push();
        await ref.set(payload);
        await audit.log('edital_publish', me?me.prontuario:'unknown', ref.key, payload);
      }else{
        const arr = JSON.parse(localStorage.getItem('editais')||'[]');
        arr.push(Object.assign({ id: 'local_'+(Date.now()), createdAt: new Date().toISOString() }, payload));
        localStorage.setItem('editais', JSON.stringify(arr));
        await audit.log('edital_publish', me?me.prontuario:'unknown', null, payload);
      }
      document.getElementById('ed-upload-status').textContent = 'Edital publicado.';
      renderLista();
    }catch(e){ console.error(e); alert('Erro ao publicar edital'); }
  }

  async function listar(){
    if(window.firebase && window.FIREBASE_CONFIG){
      if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const snap = await firebase.database().ref('/editais').once('value');
      const obj = snap.val()||{};
      return Object.keys(obj).map(k=>Object.assign({ id:k }, obj[k]));
    }else{
      return JSON.parse(localStorage.getItem('editais')||'[]');
    }
  }

  async function remover(id){
    const allowed = await perm.canAction('editais:delete');
    if(!allowed) return alert('Permissão negada');
    const me = auth.getCurrentUser();
    if(window.firebase && window.FIREBASE_CONFIG){
      await firebase.database().ref('/editais/'+id).remove();
      await audit.log('edital_delete', me?me.prontuario:'unknown', id, {});
    }else{
      let arr = JSON.parse(localStorage.getItem('editais')||'[]');
      arr = arr.filter(x=> x.id !== id);
      localStorage.setItem('editais', JSON.stringify(arr));
      await audit.log('edital_delete', me?me.prontuario:'unknown', id, {});
    }
    renderLista();
  }

  async function renderLista(){
    const container = document.getElementById(listElId);
    if(!container) return;
    container.innerHTML = '<div class="loading-spinner"><i class="fa fa-spin fa-circle-notch"></i> Carregando...</div>';
    const items = await listar();
    if(!items || items.length===0){ container.innerHTML = '<div class="info-box">Nenhum edital publicado.</div>'; return; }
    const html = items.map(it=>{
      const id = it.id || it.numero || '';
      return `<div class="res-card-agenda"><b>${escapeHtml(it.titulo||'Sem título')}</b> <span style="display:block; font-size:12px; color:var(--text-muted)">${escapeHtml(it.descricao||'')}</span><div style="margin-top:6px; display:flex; gap:8px"><button class="btn" style="width:auto; padding:6px; background:rgba(255,255,255,0.06)" onclick="viewEdital('${id}')">Ver</button> <button class="btn" style="width:auto; padding:6px; background:rgba(235,77,75,0.12)" onclick="editais.remover('${id}')">Excluir</button></div></div>`;
    }).join('');
    container.innerHTML = html;
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // publicly accessible
  return { init, publicar, listar, renderLista, remover };
})();
window.editais = editais;

// helper global for viewing an edital quickly
window.viewEdital = async function(id){
  // try firebase first
  let data = null;
  try{ if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/editais/'+id).once('value'); data = snap.val(); } }catch(e){}
  if(!data){ const arr = JSON.parse(localStorage.getItem('editais')||'[]'); data = arr.find(x=> x.id===id) || arr.find(x=> x.numero===id); }
  if(!data) return alert('Edital não encontrado');
  alert('Título: '+data.titulo+"\n\n"+ (data.descricao||'') );
};
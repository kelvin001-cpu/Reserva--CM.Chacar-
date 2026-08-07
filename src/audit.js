// src/audit.js
// Simple audit logger writing to Realtime Database (/audit/logs) or to localStorage

window.audit = (function(){
  async function log(action, actorProntuario, target, details){
    const entry = { action, actorProntuario, target, details: details||{}, timestamp: Date.now() };
    try{
      if(window.firebase && firebase.database){
        const ref = firebase.database().ref('/audit/logs').push();
        await ref.set(entry);
        return { ok:true, id: ref.key };
      } else {
        const key = 'audit:'+Date.now()+':'+Math.random().toString(36).slice(2,8);
        localStorage.setItem(key, JSON.stringify(entry));
        return { ok:true, id: key };
      }
    }catch(e){
      console.warn('audit.log failed', e);
      return { ok:false, error: String(e) };
    }
  }
  return { log };
})();

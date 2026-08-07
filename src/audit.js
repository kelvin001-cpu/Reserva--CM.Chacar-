// Simple audit logger: writes to Firebase /audit/logs or localStorage fallback
const audit = (function(){
  async function log(action, actor, target, details){
    const entry = { action, actor, target: target||null, details: details||null, ts: new Date().toISOString() };
    try{
      if(window.firebase && window.FIREBASE_CONFIG){
        if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
        const ref = firebase.database().ref('/audit/logs').push();
        await ref.set(entry);
        return entry;
      }
    }catch(e){ console.warn('audit.log firebase failed', e); }
    // fallback to localStorage
    const arr = JSON.parse(localStorage.getItem('audit_logs')||'[]');
    arr.push(entry);
    localStorage.setItem('audit_logs', JSON.stringify(arr));
    return entry;
  }
  async function list(){
    try{ if(window.firebase && window.FIREBASE_CONFIG){ if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); const snap = await firebase.database().ref('/audit/logs').once('value'); return snap.val()||{}; } }catch(e){}
    return JSON.parse(localStorage.getItem('audit_logs')||'[]');
  }
  return { log, list };
})();
window.audit = audit;
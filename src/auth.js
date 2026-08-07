// Simple auth wrapper with localStorage fallback and firebase hook
const auth = (function(){
  function setCurrentUser(user){
    if(!user) return;
    localStorage.setItem('app_current_user', JSON.stringify(user));
    // write to firebase users node if available
    try{
      if(window.firebase && window.FIREBASE_CONFIG){
        if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
        firebase.database().ref('/users/'+user.prontuario).update(user);
      }
    }catch(e){ /* ignore */ }
    // fire change event
    document.dispatchEvent(new CustomEvent('app:auth:change', { detail: user }));
  }
  function getCurrentUser(){ return JSON.parse(localStorage.getItem('app_current_user')||'null'); }
  function clear(){ localStorage.removeItem('app_current_user'); document.dispatchEvent(new CustomEvent('app:auth:change', { detail: null })); }
  return { setCurrentUser, getCurrentUser, clear };
})();
window.auth = auth;
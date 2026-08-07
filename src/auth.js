// src/auth.js
// Lightweight auth wrapper. If Firebase Auth is available it will use it. Otherwise uses localStorage for dev/testing.

window.auth = (function(){
  let currentUser = null;

  function getCurrentUser(){
    if(window.firebase && firebase.auth && firebase.auth().currentUser){
      // This is a Firebase user object; your app should map it to a user record in /users by prontuario
      return currentUser || null;
    }
    try{ const raw = localStorage.getItem('app_current_user'); currentUser = raw? JSON.parse(raw): null; }catch(e){ currentUser = null; }
    return currentUser;
  }

  function setCurrentUser(obj){
    currentUser = obj;
    try{ localStorage.setItem('app_current_user', JSON.stringify(obj)); }catch(e){}
    // update perm module state if present
    if(window.perm && perm._state) perm._state.currentUser = obj;
  }

  function clear(){ currentUser = null; localStorage.removeItem('app_current_user'); if(window.perm && perm._state) perm._state.currentUser = null; }

  return { getCurrentUser, setCurrentUser, clear };
})();

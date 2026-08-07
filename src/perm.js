// src/perm.js
// Core permissions module using Firebase Realtime Database if available.
// Usage:
//  await perm.init();
//  const user = await perm.loadUser('46690');
//  perm.canView('mod_pedagogico') => true/false

window.perm = (function(){
  const state = { inited:false, db:null, currentUser:null, roles:{}, permissionsCatalog:{} };

  async function init(){
    if(state.inited) return state;
    // Initialize Firebase if config present
    try{
      if(window.FIREBASE_CONFIG && window.firebase && window.firebase.apps && !window.firebase.apps.length){
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      if(window.firebase && window.firebase.database){
        state.db = firebase.database();
      } else {
        console.warn('Firebase Realtime Database not available. Permissions will use localStorage fallback.');
      }
    }catch(e){
      console.warn('perm.init: firebase init failed', e);
    }

    // load current user from auth wrapper or localStorage
    if(window.auth && auth.getCurrentUser){
      state.currentUser = auth.getCurrentUser();
    } else {
      try{ state.currentUser = JSON.parse(localStorage.getItem('app_current_user')); }catch(e){ state.currentUser = null; }
    }

    // load roles and permissions catalog
    if(state.db){
      const rolesSnap = await state.db.ref('/roles').once('value');
      state.roles = rolesSnap.val() || {};
      const catalogSnap = await state.db.ref('/permissions/list').once('value');
      state.permissionsCatalog = catalogSnap.val() || {};
    } else {
      state.roles = {};
      state.permissionsCatalog = {};
    }

    state.inited = true;
    // apply UI enforcement on init
    enforceUI();
    return state;
  }

  async function loadUser(prontuario){
    if(!state.db){
      const raw = localStorage.getItem('user:'+prontuario);
      return raw? JSON.parse(raw): null;
    }
    const snap = await state.db.ref(`/users/${prontuario}`).once('value');
    return snap.exists()? snap.val() : null;
  }

  async function setPermission(prontuario, permKey, value){
    if(!state.db) {
      const raw = localStorage.getItem('user:'+prontuario);
      const user = raw? JSON.parse(raw): {prontuario, permissions:{}};
      user.permissions = user.permissions || {};
      user.permissions[permKey] = !!value;
      localStorage.setItem('user:'+prontuario, JSON.stringify(user));
      await audit.log('set-permission', (state.currentUser||{}).prontuario||'system', prontuario, {permKey, value});
      return user;
    }
    await state.db.ref(`/users/${prontuario}/permissions/${permKey}`).set(!!value);
    await audit.log('set-permission', (state.currentUser||{}).prontuario||'system', prontuario, {permKey, value});
    return await loadUser(prontuario);
  }

  function _hasPermissionObj(user, key){
    if(!user) return false;
    if(user.permissions && typeof user.permissions[key] !== 'undefined') return !!user.permissions[key];
    // fallback to role defaults
    if(user.roleId && state.roles[user.roleId] && state.roles[user.roleId].defaultPermissions){
      return !!state.roles[user.roleId].defaultPermissions[key];
    }
    return false;
  }

  async function canView(key){
    if(!state.inited) await init();
    // public key
    if(!key) return true;
    // If current user is NTEi (status==='ntei' or role has admin) grant all
    const u = state.currentUser;
    if(!u) return false;
    if(u.status === 'ntei' || (u.roleId && state.roles[u.roleId] && state.roles[u.roleId].isAdmin)) return true;
    return _hasPermissionObj(u, `view:${key}`) || _hasPermissionObj(u, key);
  }

  async function canAction(actionKey){
    if(!state.inited) await init();
    const u = state.currentUser;
    if(!u) return false;
    if(u.status==='ntei' || (u.roleId && state.roles[u.roleId] && state.roles[u.roleId].isAdmin)) return true;
    return _hasPermissionObj(u, `action:${actionKey}`) || _hasPermissionObj(u, actionKey);
  }

  // Hide or show elements with data-perm attribute
  async function enforceUI(root=document){
    if(!state.inited) await init();
    const els = root.querySelectorAll('[data-perm]');
    els.forEach(async el=>{
      const key = el.getAttribute('data-perm');
      const allowed = await canView(key);
      if(!allowed) el.style.display = 'none';
      else el.style.display = '';
    });
  }

  // subscribe to permission changes for a user
  function onUserPermissionsChange(prontuario, cb){
    if(!state.db) return () => {};
    const ref = state.db.ref(`/users/${prontuario}/permissions`);
    const handler = snap => cb(snap.val()||{});
    ref.on('value', handler);
    return () => ref.off('value', handler);
  }

  return { init, loadUser, setPermission, canView, canAction, enforceUI, onUserPermissionsChange, _state: state };
})();
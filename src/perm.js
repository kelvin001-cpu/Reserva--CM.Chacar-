// Basic permission system - supports Firebase Realtime DB or localStorage fallback
const perm = (function(){
  const state = {
    roles: {},
    users: {},
    currentUser: null,
    inited: false,
    useFirebase: false,
    dbRef: null
  };

  async function init(){
    if(state.inited) return;
    // try to connect to firebase if config exists
    try{
      if(window.FIREBASE_CONFIG && window.firebase && firebase.database){
        firebase.initializeApp(window.FIREBASE_CONFIG);
        state.dbRef = firebase.database();
        state.useFirebase = true;
        // load roles and users once
        const rolesSnap = await state.dbRef.ref('/roles').once('value');
        const usersSnap = await state.dbRef.ref('/users').once('value');
        state.roles = rolesSnap.val() || {};
        state.users = usersSnap.val() || {};
      }else{
        // load from localStorage fallback
        state.roles = JSON.parse(localStorage.getItem('perm_roles')||'{}');
        state.users = JSON.parse(localStorage.getItem('perm_users')||'{}');
      }
    }catch(err){
      console.warn('perm.init: firebase unavailable, fallback to localStorage', err);
      state.roles = JSON.parse(localStorage.getItem('perm_roles')||'{}');
      state.users = JSON.parse(localStorage.getItem('perm_users')||'{}');
    }
    // current user from auth module if available
    state.currentUser = (window.auth && auth.getCurrentUser && auth.getCurrentUser()) || JSON.parse(localStorage.getItem('app_current_user')||'null');
    state.inited = true;
  }

  function _getUser(prontuario){
    if(!prontuario){ return state.currentUser; }
    return state.users && state.users[prontuario];
  }

  async function canAction(key, user){
    await init();
    const u = user || state.currentUser || JSON.parse(localStorage.getItem('app_current_user')||'null');
    if(!u) return false;
    // NTEi override
    if(u.roleId === 'ntei' || u.status === 'ntei') return true;
    // check explicit user permissions
    const stored = (state.users && state.users[u.prontuario] && state.users[u.prontuario].permissions) || (u.permissions) || {};
    if(typeof stored[key] !== 'undefined') return !!stored[key];
    // check role defaults
    const role = (state.roles && state.roles[u.roleId]) || {};
    if(role.defaultPermissions && typeof role.defaultPermissions[key] !== 'undefined') return !!role.defaultPermissions[key];
    // default deny
    return false;
  }

  async function canView(key, user){ return canAction('view:'+key, user); }

  async function enforceUI(root){
    await init();
    root = root || document;
    const els = root.querySelectorAll('[data-perm]');
    for(const el of els){
      const permKey = el.getAttribute('data-perm');
      try{
        const allowed = await canAction(permKey);
        if(!allowed) el.style.display='none';
        else el.style.display='inline-block';
      }catch(e){ console.error('perm.enforceUI', e); }
    }
  }

  async function setUserPermissions(prontuario, permissions){
    await init();
    if(state.useFirebase){
      return state.dbRef.ref('/users/'+prontuario+'/permissions').set(permissions);
    }else{
      state.users = state.users || {};
      state.users[prontuario] = state.users[prontuario] || {};
      state.users[prontuario].permissions = permissions;
      localStorage.setItem('perm_users', JSON.stringify(state.users));
      return Promise.resolve(true);
    }
  }

  async function getUser(prontuario){
    await init();
    if(state.useFirebase){
      const snap = await state.dbRef.ref('/users/'+prontuario).once('value');
      return snap.val();
    }else{
      return state.users && state.users[prontuario];
    }
  }

  async function listRoles(){ await init(); return state.roles || {}; }

  return { init, canAction, canView, enforceUI, setUserPermissions, getUser, listRoles };
})();

window.perm = perm;
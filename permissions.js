// permissions.js
// Minimal client-side permission system that reads config/permissions from Firebase Realtime Database
// - Loads config/permissions (roles + users overrides)
// - Exposes Permissions.init(user) and Permissions.has(user, module, action)
// - Applies UI rules: hides elements with data-perm="module:action" if not allowed

const Permissions = (function(){
    let roles = null;
    let users = null;
    let ready = false;
    let currentUser = null;

    // default role mapping if no config exists
    const defaultRoles = {
        NTEi: { wildcard: true },
        Gestão: {
            editais: { publicar: true, criar: true, editar: true, excluir: true },
            comunicacao: { comunicados: true, enquetes: true },
            reservas: { reservar: true }
        },
        Secretaria: {
            comunicacao: { comunicados: true },
            reservas: { reservar: true }
        },
        Professor: {
            comunicacao: { mural: true, chat: true },
            reservas: { reservar: true }
        },
        SMETi: { wildcard: false }
    };

    async function load() {
        try {
            const snap = await db.ref('config/permissions').once('value');
            const data = snap.exists() ? snap.val() : null;
            roles = data && data.roles ? data.roles : defaultRoles;
            users = data && data.users ? data.users : {};
            ready = true;
            // listen for live updates
            db.ref('config/permissions').on('value', s => {
                const d = s.val();
                roles = d && d.roles ? d.roles : roles || defaultRoles;
                users = d && d.users ? d.users : users || {};
                applyUI();
            });
        } catch(e) { console.error('Permissions.load error', e); roles = defaultRoles; users = {}; ready = true; }
    }

    function isSuper(user) {
        if(!user) return false;
        if(user.cargo === 'NTEi') return true;
        if(String(user.pront) === '46690') return true;
        return false;
    }

    function has(user, module, action) {
        if(!ready) {
            console.warn('Permissions not ready, denying by default');
            return false;
        }
        if(isSuper(user)) return true;
        if(!user) return false;
        const u = users && users[user.pront];
        if(u && u[module] && (action in u[module])) return Boolean(u[module][action]);
        const r = roles && roles[user.cargo];
        if(!r) return false;
        if(r.wildcard) return true;
        if(r[module] && (action in r[module])) return Boolean(r[module][action]);
        return false;
    }

    function parsePermString(s) {
        // format: module:action
        if(!s) return null;
        const parts = s.split(':'); if(parts.length < 2) return null;
        return { module: parts[0].trim(), action: parts[1].trim() };
    }

    function applyUI() {
        // Hide elements that have data-perm="module:action"
        document.querySelectorAll('[data-perm]').forEach(el => {
            const p = parsePermString(el.getAttribute('data-perm'));
            if(!p) return;
            const allowed = has(currentUser, p.module, p.action);
            if(!allowed) el.classList.add('hidden'); else el.classList.remove('hidden');
        });
    }

    // Intercept clicks on elements with data-perm to prevent action if not allowed
    document.addEventListener('click', function(e){
        let el = e.target;
        while(el && el !== document) {
            if(el.hasAttribute && el.hasAttribute('data-perm')) {
                const p = parsePermString(el.getAttribute('data-perm'));
                if(p && !has(currentUser, p.module, p.action)) {
                    e.stopImmediatePropagation(); e.preventDefault();
                    alert('Ação não permitida: você não tem permissão para executar esta operação.');
                    return false;
                }
                break; // permitted, allow
            }
            el = el.parentNode;
        }
    }, true);

    return {
        init: async function(user) {
            currentUser = user;
            if(!ready) await load();
            applyUI();
        },
        has: function(user, module, action) { return has(user, module, action); },
        _internal: { roles, users }
    };
})();

// expose globally
window.Permissions = Permissions;

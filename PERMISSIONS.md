# PERMISSIONS.md

This file documents the permissions architecture implemented in src/perm.js and the admin UI in src/admin-permissions.js.

Data model (Realtime Database)

- /users/{prontuario}
  - name: string
  - prontuarium: string
  - roleId: string
  - status: one of [ativo, pendente, bloqueado, ntei]
  - avatarUrl: string
  - permissions: { "view:mod_pedagogico": true, "editais:create": false, ... }

- /roles/{roleId}
  - name: string
  - isAdmin: boolean
  - defaultPermissions: { ... }

- /permissions/list -> catalog of known permissions (optional)

- /audit/logs/{id} -> { action, actorProntuario, target, details, timestamp }

- /geo/rooms -> geo-seed entries

How permissions are evaluated

- perm.init() loads roles and permission catalog from the database (if available).
- The current user is taken from auth.getCurrentUser() or localStorage (app_current_user).
- canView(key) & canAction(key) return true if:
  - the user status === 'ntei' OR
  - the user's role has isAdmin=true OR
  - the user's explicit permissions include the key OR
  - the user's role defaultPermissions include the key

UI integration

- Add data-perm="permission.key" attributes to buttons/menus in the HTML to automatically hide elements for users without view permission.
- Example: <button data-perm="mod_pedagogico">Pedagógico</button>
- After perm.init(), call perm.enforceUI() to apply hiding.

Admin area

- src/admin-permissions.js adds a floating "Admin Acessos" button visible only to NTEi users; it opens a modal where NTEi can search by prontuário and add/remove permissions.
- All permission changes are audited via /audit/logs.

Setup

1. Create a local file `firebase-config.js` (gitignored) using firebase-config.example.js and set `window.FIREBASE_CONFIG`.
2. Ensure Firebase Realtime Database is enabled in your Firebase project.
3. Seed roles and rooms (you can upload src/geo-seed.json to /geo/rooms or use the admin UI to create rooms).

Security rules (Realtime DB) example

See rules_realtime.rules for a starting point. Adjust for your environment.


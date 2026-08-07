# Permissions model

This project uses a centralized permissions model. Permissions keys are strings and follow a dotted convention.

Examples:
- editais:create - allow creating/publishing editais
- editais:edit - allow editing editais
- editais:delete - allow deleting editais
- mod_pedagogico - show/hide pedagogical module
- mod_editais - show/hide editais module

Roles are defined under /roles in the Realtime Database (or in localStorage fallback under key `perm_roles`).
Users can have explicit `permissions` object that overrides role defaults.

Use `perm.canAction(permissionKey)` to check authorization before performing any sensitive action.

const sysApp = {
    user: null,
    currentTicket: null,
    
    inicio: {
        ir_para_login() {
            document.getElementById('intro-screen').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
            this.preencherLoginForms();
        },
        
        preencherLoginForms() {
            // Carregar últimas opções de login (localStorage)
            const savedCargo = localStorage.getItem('ultimoCargo');
            if (savedCargo === 'SEFE' && !isSefeRestrictedToday()) {
                document.getElementById('sefe-column').style.opacity = '0.4';
                document.getElementById('sefe-column').style.pointerEvents = 'none';
            }
        }
    },
    
    auth: {
        async login(pre, cargo) {
            const pEl = document.getElementById(pre + '-p');
            const sEl = document.getElementById(pre + '-s');
            const p = pEl?.value?.trim();
            const s = sEl?.value?.trim();
            
            if (!p || !s) return alert('Informe prontuário e senha.');
            
            // Validações especiais
            if (cargo === 'SEFE' && !isSefeRestrictedToday()) {
                return alert('⚠️ Acesso SEFE disponível apenas em Terça e Quarta (07 e 08/07).');
            }
            
            if (cargo !== 'SEFE' && cargo !== 'NTEi' && isSefeRestrictedToday()) {
                return alert('⚠️ Acesso temporariamente indisponível. Tente novamente após o retorno do funcionamento normal.');
            }
            
            try {
                const snap = await db.ref('usuarios/' + p).once('value');
                
                if (!snap.exists()) {
                    // Primeiro acesso NTEi com senha de fábrica
                    if (cargo === 'NTEi' && p === '46690' && s === CONFIG.senhaspadrao.NTEi) {
                        const novaPass = prompt('🔒 PRIMEIRO ACESSO: defina uma nova senha forte (mín 8 chars):');
                        if (!novaPass || novaPass.length < 8) return alert('Senha muito fraca. Mínimo 8 caracteres.');
                        
                        await db.ref('usuarios/46690').set({
                            nome: 'Kelvin NTEi',
                            pront: '46690',
                            cargo: 'NTEi',
                            pass: novaPass,
                            status: 'ativo',
                            criado_em: new Date().toLocaleString('pt-BR')
                        });
                        
                        sysApp.user = { nome: 'Kelvin NTEi', pront: '46690', cargo: 'NTEi' };
                        localStorage.setItem('ultimoCargo', 'NTEi');
                        alert('✅ Conta NTEi criada com segurança!');
                        return sysApp.auth.iniciar_sistema();
                    }
                    return alert('Prontuário não cadastrado ou inválido.');
                }
                
                const userData = snap.val();
                
                // Validações de status
                if (userData.status === 'pendente') return alert('⏳ Conta aguardando ativação pelo NTEi.');
                if (userData.status === 'bloqueado_permanente') return alert('❌ ACESSO NEGADO: Conta bloqueada permanentemente.');
                if (userData.status === 'bloqueado_temporario' && userData.bloqueado_ate) {
                    const hoje = new Date().toISOString().split('T')[0];
                    if (hoje <= userData.bloqueado_ate) return alert(`⚠️ Bloqueado até ${userData.bloqueado_ate.split('-').reverse().join('/')}`);
                }
                
                // Verificar senha
                if (String(userData.pass) !== String(s)) return alert('Senha incorreta.');
                
                sysApp.user = { ...userData, pront: p };
                localStorage.setItem('ultimoCargo', cargo);
                
                // Forçar troca de senha se for padrão
                if (CONFIG.senhaspadrao[cargo] && s === CONFIG.senhaspadrao[cargo]) {
                    const novaSenha = prompt('🔒 SEGURANÇA: Senha padrão detectada.\nDigite uma NOVA SENHA:');
                    if (novaSenha && novaSenha.length >= 4) {
                        await db.ref('usuarios/' + p).update({ pass: novaSenha });
                        alert('✅ Senha atualizada!');
                    } else return alert('Senha inválida.');
                }
                
                sysApp.auth.iniciar_sistema();
                
            } catch (e) {
                alert('Erro de autenticação: ' + e.message);
            }
        },
        
        async confirmar_cadastro() {
            const n = document.getElementById('c-n').value?.trim();
            const p = document.getElementById('c-p').value?.trim();
            const e = document.getElementById('c-e').value?.trim();
            const c = document.getElementById('c-c').value;
            
            if (!n || !p || !e || !c) return alert('Preencha todos os campos.');
            if (!e.includes('@edu')) return alert('Use um e-mail @edu válido.');
            
            const senhaInicial = CONFIG.senhaspadrao[c.split(' ')[0]] || 'mudar123';
            
            try {
                await db.ref('usuarios/' + p).set({
                    nome: n,
                    pront: p,
                    cargo: c,
                    pass: senhaInicial,
                    email: e,
                    status: 'pendente',
                    solicitado_em: new Date().toLocaleString('pt-BR')
                });
                
                alert(`✅ Solicitação enviada!\n\nSenha inicial: ${senhaInicial}\nAguarde o NTEi ativar sua conta.`);
                document.getElementById('c-n').value = '';
                document.getElementById('c-p').value = '';
                document.getElementById('c-e').value = '';
                
            } catch (e) {
                alert('Erro ao criar conta: ' + e.message);
            }
        },
        
        iniciar_sistema() {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-system').style.display = 'block';
            document.getElementById('topbar').style.display = 'flex';
            
            document.getElementById('topbar-username').textContent = `${sysApp.user.nome} · ${sysApp.user.cargo}`;
            
            sysApp.sistema.aplicar_restricoes_menu();
            sysApp.sistema.carregar_menus_dinamicos();
            sysApp.sistema.sync_dados_reais();
        }
    },
    
    sistema: {
        aplicar_restricoes_menu() {
            const cargo = sysApp.user?.cargo;
            const topbar = document.getElementById('topbar-nav');
            
            if (!topbar) return;
            
            // Menus base por cargo
            let menus = [];
            
            if (cargo === 'Professor' || cargo === 'SEFE') {
                menus = [
                    { id: 'operacional', nome: 'Operacional', icon: 'fa-tools' },
                    { id: 'pedagogico', nome: 'Pedagógico', icon: 'fa-book' },
                    { id: 'alunos', nome: 'Alunos', icon: 'fa-users' },
                    { id: 'formacao', nome: 'Formação', icon: 'fa-graduation-cap' },
                    { id: 'comunicacao', nome: 'Comunicação', icon: 'fa-comments' }
                ];
            } else if (cargo === 'Gestão' || cargo === 'SMETi') {
                menus = [
                    { id: 'dashboard', nome: 'Dashboard', icon: 'fa-gauge' },
                    { id: 'operacional', nome: 'Operacional', icon: 'fa-tools' },
                    { id: 'pedagogico', nome: 'Pedagógico', icon: 'fa-book' },
                    { id: 'alunos', nome: 'Alunos', icon: 'fa-users' },
                    { id: 'formacao', nome: 'Formação', icon: 'fa-graduation-cap' },
                    { id: 'comunicacao', nome: 'Comunicação', icon: 'fa-comments' }
                ];
            } else if (cargo === 'NTEi') {
                menus = [
                    { id: 'dashboard', nome: 'Dashboard', icon: 'fa-gauge' },
                    { id: 'operacional', nome: 'Operacional', icon: 'fa-tools' },
                    { id: 'pedagogico', nome: 'Pedagógico', icon: 'fa-book' },
                    { id: 'alunos', nome: 'Alunos', icon: 'fa-users' },
                    { id: 'formacao', nome: 'Formação', icon: 'fa-graduation-cap' },
                    { id: 'comunicacao', nome: 'Comunicação', icon: 'fa-comments' },
                    { id: 'admin', nome: 'Admin NTEi', icon: 'fa-shield' }
                ];
            }
            
            topbar.innerHTML = menus.map(m => `
                <button class="topbar-btn" onclick="sysApp.sistema.mudar_modulo('${m.id}')">
                    <i class="fa ${m.icon}"></i> ${m.nome}
                </button>
            `).join('');
        },
        
        mudar_modulo(id) {
            document.querySelectorAll('.module-view').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.topbar-btn').forEach(b => b.classList.remove('active'));
            
            const modEl = document.getElementById('mod-' + id);
            if (modEl) {
                modEl.classList.add('active');
                modEl.classList.remove('hidden');
            }
            
            event.target.closest('.topbar-btn').classList.add('active');
        },
        
        carregar_menus_dinamicos() {
            db.ref('config/menus_customizados').on('value', snap => {
                const menus = snap.val() || {};
                Object.entries(menus).forEach(([id, menu]) => {
                    if (menu.ativo && (menu.permitidos.includes(sysApp.user?.cargo) || menu.permitidos.includes('Todos'))) {
                        // Renderizar menu customizado
                        console.log('Menu customizado:', menu.nome);
                    }
                });
            });
        },
        
        sync_dados_reais() {
            // Sincronizar reservas, chamados, etc
            sysApp.operacional.carregar_reservas();
        }
    },
    
    operacional: {
        async reservar() {
            const eqId = document.getElementById('res-eq').value;
            const sala = document.getElementById('res-sl').value?.trim();
            const dt = document.getElementById('res-dt').value;
            
            if (!eqId || !sala || !dt) return alert('Preencha todos os campos.');
            
            try {
                const eqSnap = await db.ref('equipamentos/' + eqId).once('value');
                const eq = eqSnap.val();
                
                if (!eq) return alert('Equipamento não encontrado.');
                
                await db.ref('equipamentos/' + eqId).update({ status: 'ocupado' });
                await db.ref('reservas').push({
                    equip_id: eqId,
                    eq_nome: eq.nome,
                    sala: sala,
                    data_hora: dt,
                    usuario: sysApp.user.nome,
                    pront: sysApp.user.pront,
                    status: 'em_uso',
                    timestamp: Date.now()
                });
                
                alert('✅ Reserva criada com sucesso!');
                document.getElementById('res-sl').value = '';
                document.getElementById('res-dt').value = '';
                this.carregar_reservas();
                
            } catch (e) {
                alert('Erro ao criar reserva: ' + e.message);
            }
        },
        
        update_subcategorias() {
            const tipo = document.getElementById('chamado-tipo').value;
            const opts = {
                'Hardware': ['Chromebook','PC','Projetor','Impressora'],
                'Software': ['Sisgem','Siseduc','Sistema Operacional'],
                'Senhas': ['Reset Email','Sisgem','Siseduc'],
                'Alunos': ['Sem conta','Login incorreto','Plataforma'],
                'Rede': ['Wi-Fi','Cabo','Sem Internet']
            };
            // Implementar subcategorias se necessário
        },
        
        async abrir_chamado() {
            const tipo = document.getElementById('chamado-tipo').value;
            const desc = document.getElementById('chamado-desc').value?.trim();
            
            if (sysApp.user.cargo === 'SEFE') {
                // SEFE abre chamado direto com NTEi, sem categoria
                if (!desc) return alert('Descreva o que você precisa.');
                
                try {
                    await db.ref('chamados_sefe').push({
                        usuario: sysApp.user.nome,
                        pront: sysApp.user.pront,
                        descricao: desc,
                        status: 'aberto_com_ntei',
                        criado_em: new Date().toLocaleString('pt-BR')
                    });
                    
                    alert('✅ Chamado aberto! Aguarde resposta do NTEi.');
                    document.getElementById('chamado-desc').value = '';
                    sysApp.sistema.mudar_modulo('comunicacao');
                    
                } catch (e) {
                    alert('Erro: ' + e.message);
                }
            } else {
                // Outros cargos abrem chamado normal com categorias
                if (!tipo || !desc) return alert('Preencha todos os campos.');
                
                try {
                    await db.ref('chamados').push({
                        usuario: sysApp.user.nome,
                        pront: sysApp.user.pront,
                        tipo: tipo,
                        descricao: desc,
                        status: 'aberto',
                        criado_em: new Date().toLocaleString('pt-BR')
                    });
                    
                    alert('✅ Chamado enviado!');
                    document.getElementById('chamado-desc').value = '';
                    
                } catch (e) {
                    alert('Erro: ' + e.message);
                }
            }
        },
        
        carregar_reservas() {
            db.ref('reservas').on('value', snap => {
                const container = document.getElementById('lista-reservas-ativas');
                if (!container) return;
                
                container.innerHTML = '';
                snap.forEach(r => {
                    const d = r.val();
                    if (d && d.status === 'em_uso') {
                        container.innerHTML += `
                            <div style="border-left:4px solid var(--cad); background:rgba(255,255,255,0.04); padding:10px; margin-bottom:8px; border-radius:6px">
                                <b>💻 ${d.eq_nome}</b> - Sala ${d.sala}<br>
                                <small style="color:#aaa">⏰ ${d.data_hora.replace('T', ' às ')}</small><br>
                                <small>👤 Por: ${d.usuario}</small>
                            </div>
                        `;
                    }
                });
                
                if (container.innerHTML === '') {
                    container.innerHTML = '<p style="text-align:center; color:#666; font-size:12px">Nenhuma reserva ativa.</p>';
                }
            });
        }
    },
    
    pedagogico: {
        async salvar_planejamento() {
            const titulo = document.getElementById('plan-titulo').value?.trim();
            const turma = document.getElementById('plan-turma').value?.trim();
            const bimestre = document.getElementById('plan-bimestre').value?.trim();
            
            if (!titulo || !turma) return alert('Preencha título e turma.');
            
            try {
                await db.ref('planejamentos').push({
                    titulo: titulo,
                    turma: turma,
                    bimestre: bimestre,
                    professor: sysApp.user.nome,
                    criado_em: new Date().toLocaleString('pt-BR')
                });
                
                alert('✅ Planejamento salvo!');
                document.getElementById('plan-titulo').value = '';
                document.getElementById('plan-turma').value = '';
                document.getElementById('plan-bimestre').value = '';
                
            } catch (e) {
                alert('Erro: ' + e.message);
            }
        }
    },
    
    alunos: {
        async salvar_aluno() {
            const nome = document.getElementById('al-nome').value?.trim();
            const usuario = document.getElementById('al-user').value?.trim();
            const senha = document.getElementById('al-pass').value?.trim();
            
            if (!nome || !usuario) return alert('Preencha nome e usuário.');
            
            try {
                await db.ref('alunos/' + sysApp.user.pront).push({
                    nome: nome,
                    usuario: usuario,
                    senha: senha || 'aluno123',
                    cadastrado_em: new Date().toLocaleString('pt-BR')
                });
                
                alert('✅ Aluno cadastrado!');
                document.getElementById('al-nome').value = '';
                document.getElementById('al-user').value = '';
                document.getElementById('al-pass').value = '';
                
            } catch (e) {
                alert('Erro: ' + e.message);
            }
        }
    },
    
    formacao: {
        async salvar_trilha() {
            const nome = document.getElementById('trilha-nome').value?.trim();
            const carga = document.getElementById('trilha-carga').value?.trim();
            
            if (!nome) return alert('Informe o nome da trilha.');
            
            try {
                await db.ref('trilhas_formativas').push({
                    nome: nome,
                    carga_horaria: carga || '0',
                    professor: sysApp.user.nome,
                    criada_em: new Date().toLocaleString('pt-BR')
                });
                
                alert('✅ Trilha criada!');
                document.getElementById('trilha-nome').value = '';
                document.getElementById('trilha-carga').value = '';
                
            } catch (e) {
                alert('Erro: ' + e.message);
            }
        }
    },
    
    comunicacao: {
        async enviar_chat_nti() {
            const msg = document.getElementById('chat-nti-in').value?.trim();
            
            if (!msg) return;
            
            try {
                // Para SEFE, sempre fala com NTEi
                // Para Professor, também fala com NTEi (não com outros)
                
                const destino = 'chat_privado_ntei';
                
                await db.ref(destino).push({
                    from_user: sysApp.user.nome,
                    from_pront: sysApp.user.pront,
                    from_cargo: sysApp.user.cargo,
                    message: msg,
                    timestamp: new Date().toLocaleString('pt-BR')
                });
                
                document.getElementById('chat-nti-in').value = '';
                this.carregar_chat_nti();
                
            } catch (e) {
                alert('Erro ao enviar: ' + e.message);
            }
        },
        
        carregar_chat_nti() {
            db.ref('chat_privado_ntei').limitToLast(20).on('value', snap => {
                const box = document.getElementById('chat-nti-box');
                if (!box) return;
                
                box.innerHTML = '';
                snap.forEach(m => {
                    const d = m.val();
                    const isMio = d.from_pront === sysApp.user.pront;
                    box.innerHTML += `
                        <div style="background:${isMio ? 'rgba(0,173,239,0.2)' : 'rgba(255,255,255,0.05)'}; padding:8px; margin:5px 0; border-radius:6px; font-size:12px">
                            <b>${d.from_user}</b> (${d.from_cargo})<br>
                            ${d.message}<br>
                            <small style="color:#666">${d.timestamp}</small>
                        </div>
                    `;
                });
                
                box.scrollTop = box.scrollHeight;
            });
        }
    },
    
    admin: {
        bloquear_site() {
            db.ref('config/maintenance').set(true).then(() => alert('🔒 Site bloqueado para manutenção!'));
        },
        
        liberar_site() {
            db.ref('config/maintenance').set(false).then(() => alert('✅ Site liberado!'));
        },
        
        async criar_novo_menu() {
            const nome = document.getElementById('novo-menu-nome').value?.trim();
            const icon = document.getElementById('novo-menu-icon').value?.trim();
            const cargo = document.getElementById('novo-menu-cargo').value;
            
            if (!nome || !icon) return alert('Preencha nome e ícone.');
            
            try {
                await db.ref('config/menus_customizados').push({
                    nome: nome,
                    icon: icon,
                    permitidos: cargo === 'Todos' ? ['Professor','Gestão','NTEi','SMETi','SEFE','Secretaria'] : [cargo],
                    ativo: true,
                    criado_em: new Date().toLocaleString('pt-BR')
                });
                
                alert('✅ Menu criado!');
                document.getElementById('novo-menu-nome').value = '';
                document.getElementById('novo-menu-icon').value = '';
                this.listar_menus_gerenciados();
                
            } catch (e) {
                alert('Erro: ' + e.message);
            }
        },
        
        listar_menus_gerenciados() {
            db.ref('config/menus_customizados').on('value', snap => {
                const container = document.getElementById('lista-menus-gerenciados');
                if (!container) return;
                
                container.innerHTML = '';
                snap.forEach(m => {
                    const d = m.val();
                    container.innerHTML += `
                        <div style="border:1px solid var(--border-subtle); padding:10px; margin:5px 0; border-radius:6px; font-size:12px">
                            <b>📍 ${d.nome}</b> (${d.permitidos.join(', ')})<br>
                            <button class="btn" style="width:auto; padding:4px 8px; margin:5px 0 0 0; font-size:10px; background:var(--ntei)" onclick="sysApp.admin.deletar_menu('${m.key}')">Deletar</button>
                        </div>
                    `;
                });
            });
        },
        
        deletar_menu(id) {
            if (confirm('Deletar este menu?')) {
                db.ref('config/menus_customizados/' + id).remove().then(() => alert('✅ Menu deletado!'));
            }
        }
    }
};
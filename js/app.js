// App initialization and setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Programa Conect iniciando...');
    
    // Se já foi visto a intro antes, pula direto para login
    const introVisto = localStorage.getItem('introVisto');
    if (introVisto) {
        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
    } else {
        localStorage.setItem('introVisto', 'true');
    }
    
    // Carregar últimas opções salvas
    const lastCargo = localStorage.getItem('ultimoCargo');
    if (lastCargo) {
        console.log(`Último cargo acessado: ${lastCargo}`);
    }
    
    // Listener para manutenção do sistema
    db.ref('config/maintenance').on('value', snap => {
        const locked = snap.val();
        if (locked && sysApp.user && sysApp.user.cargo !== 'NTEi') {
            alert('⚠️ Sistema em manutenção. Tente novamente mais tarde.');
            location.reload();
        }
    });
});

// Carregar chat em tempo real quando em comunicação
setInterval(() => {
    if (sysApp.user && document.getElementById('main-system').style.display === 'block') {
        const modAtual = document.querySelector('.module-view.active');
        if (modAtual && modAtual.id === 'mod-comunicacao') {
            sysApp.comunicacao.carregar_chat_nti();
        }
    }
}, 2000);

console.log('✅ App.js carregado');
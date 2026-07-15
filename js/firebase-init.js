// Firebase Initialization
const firebaseConfig = {
    databaseURL: "https://escala-chacara-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global config
const CONFIG = {
    diasRestritosSEFE: ["2026-07-07", "2026-07-08"],
    senhaspadrao: {
        Prof: "pmspmudar123",
        Gestao: "pmspgestores2026",
        Secretaria: "secretaria2026",
        SMETi: "smeti2026",
        SEFE: "sefe2026",
        NTEi: "nti2026"
    }
};

// Check if today is SEFE restricted
function isSefeRestrictedToday() {
    const hoje = new Date().toISOString().split('T')[0];
    return CONFIG.diasRestritosSEFE.includes(hoje);
}
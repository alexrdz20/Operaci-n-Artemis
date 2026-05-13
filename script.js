let currentSceneIndex = 0;
let diagActive = false;
const safePath = ['paneles', 'rele_a', 'rele_c', 'sop_vital'];

const nodes = [
    { id: 'paneles', name: 'PANELES DE RESPALDO', x: 0.15, y: 0.25 },
    { id: 'rele_a', name: 'RELÉ A', x: 0.4, y: 0.2 },
    { id: 'rele_b', name: 'RELÉ B', x: 0.4, y: 0.6, error: true },
    { id: 'rele_c', name: 'RELÉ C', x: 0.6, y: 0.3 },
    { id: 'mod_servicio', name: 'MÓDULO DE SERVICIO', x: 0.55, y: 0.8, error: true },
    { id: 'sop_vital', name: 'SOPORTE VITAL', x: 0.85, y: 0.35 },
    { id: 'mod_comando', name: 'MÓDULO DE COMANDO', x: 0.8, y: 0.65 }
];

const edges = [
    { from: 'paneles', to: 'rele_a' }, { from: 'paneles', to: 'rele_b' },
    { from: 'rele_a', to: 'rele_c' }, { from: 'rele_a', to: 'mod_servicio' },
    { from: 'rele_b', to: 'mod_servicio' },
    { from: 'rele_c', to: 'sop_vital' }, { from: 'rele_c', to: 'mod_comando' },
    { from: 'mod_servicio', to: 'mod_comando' }
];

// -- Scene Management --
function updateScenes() {
    const scenes = document.querySelectorAll('.scene');
    const dots = document.querySelectorAll('.dot');
    const header = document.getElementById('main-header');
    const footer = document.getElementById('main-footer');
    const prevBtn = document.querySelector('.nav-btn:first-child');

    if (currentSceneIndex === 0) {
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
    } else {
        if (header) header.style.display = 'flex';
        if (footer) footer.style.display = 'flex';
        if (prevBtn) prevBtn.style.visibility = (currentSceneIndex === 1) ? 'hidden' : 'visible';
    }

    scenes.forEach((s, i) => s.classList.toggle('active', i === currentSceneIndex));
    dots.forEach((d, i) => d.classList.toggle('active', (i + 1) === currentSceneIndex));
    
    if (currentSceneIndex === 1 || currentSceneIndex === 4) {
        setTimeout(resize, 100);
    }
}

function nextScene() { if (currentSceneIndex < 4) { currentSceneIndex++; updateScenes(); } }
function prevScene() { if (currentSceneIndex > 1) { currentSceneIndex--; updateScenes(); } }
function goToScene(i) { currentSceneIndex = i; updateScenes(); }

// -- Canvases --
const canvasIds = ['networkCanvas', 'finalMapCanvas'];

function resize() {
    canvasIds.forEach(id => {
        const c = document.getElementById(id);
        if (!c || !c.parentElement) return;
        c.width = c.parentElement.offsetWidth;
        c.height = c.parentElement.offsetHeight;
    });
}

function draw() {
    canvasIds.forEach(id => {
        const c = document.getElementById(id);
        if (!c) return;
        
        // Only draw final map when diagnosis is complete
        if (id === 'finalMapCanvas' && !diagActive) {
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            return;
        }

        const ctx = c.getContext('2d');
        const w = c.width;
        const h = c.height;
        ctx.clearRect(0, 0, w, h);

        edges.forEach(e => {
            if (id === 'finalMapCanvas' && (!safePath.includes(e.from) || !safePath.includes(e.to))) return;

            const n1 = nodes.find(n => n.id === e.from);
            const n2 = nodes.find(n => n.id === e.to);
            const inPath = diagActive && safePath.includes(e.from) && safePath.includes(e.to) && 
                           safePath.indexOf(e.to) === safePath.indexOf(e.from) + 1;
            
            const isBurnt = n1.error || n2.error;

            ctx.beginPath();
            ctx.moveTo(n1.x * w, n1.y * h); ctx.lineTo(n2.x * w, n2.y * h);
            
            if (inPath) {
                ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 6;
                ctx.shadowBlur = 15; ctx.shadowColor = '#ffd700';
            } else if (isBurnt) {
                ctx.strokeStyle = 'rgba(255, 49, 49, 0.4)'; ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
            } else {
                ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)'; ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
        });

        nodes.forEach(n => {
            if (id === 'finalMapCanvas' && !safePath.includes(n.id)) return;

            const x = n.x * w;
            const y = n.y * h;

            ctx.beginPath();
            ctx.arc(x, y, 14, 0, Math.PI * 2);
            if (n.error) {
                const blink = Math.sin(Date.now()/150) > 0;
                ctx.fillStyle = blink ? '#ff3131' : '#300';
                ctx.shadowBlur = blink ? 20 : 0; ctx.shadowColor = '#ff3131';
            } else {
                ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.strokeStyle = '#00f2ff';
                ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
            }
            ctx.fill();

            ctx.fillStyle = n.error ? '#ff3131' : '#00f2ff';
            ctx.font = 'bold 12px "Share Tech Mono"';
            ctx.textAlign = 'center';
            ctx.fillText(n.name, x, y - 25);
            
            if (n.error) {
                ctx.font = 'bold 8px "Share Tech Mono"';
                ctx.fillText('ERROR: RADIACIÓN DETECTADA', x, y + 22);
            }
            if (n.id === 'mod_comando') {
                ctx.font = 'bold 8px "Share Tech Mono"'; ctx.fillStyle = '#00f2ff';
                ctx.fillText('[ COMANDANTE: EN POSICIÓN ]', x, y + 22);
            }
            if (n.id === 'mod_servicio') {
                ctx.font = 'bold 8px "Share Tech Mono"'; ctx.fillStyle = '#ff3131';
                ctx.fillText('[ INGENIERA: BLOQUEADA ]', x, y + 32);
            }
        });
    });
    requestAnimationFrame(draw);
}

// -- Secuencia Automatizada de Misión (Sincronizada a 90s) --
async function startAutomatedSequence() {
    // 1. Mostrar Mapa Limpio (Tiempo para Intro + Mapa)
    goToScene(1);
    nodes.forEach(n => { n.originalError = n.error; n.error = false; }); 
    await new Promise(r => setTimeout(r, 8000)); // Reducido de 10s a 8s

    // 2. Escaneo de Radiación (4s de animación + 8s de explicación de daños)
    const statusPanel = document.querySelector('.mission-status-panel');
    statusPanel.innerHTML += '<div class="line gold blink" id="scan-notif">> ESCANEANDO RADIACIÓN...</div>';
    await new Promise(r => setTimeout(r, 4000)); // Reducido de 5s a 4s
    
    nodes.forEach(n => { n.error = n.originalError; });
    document.getElementById('scan-notif').innerText = "> RADIACIÓN DETECTADA EN RELÉS CENTRALES";
    document.getElementById('scan-notif').classList.replace('gold', 'red');
    await new Promise(r => setTimeout(r, 8000)); // Reducido de 10s a 8s

    // 3. Transición al Código (Hechos - 20s para explicar)
    goToScene(2);
    const codeViewB = document.querySelector('#scene-b .code-view');
    if (codeViewB) codeViewB.classList.add('analyzing');
    await new Promise(r => setTimeout(r, 20000));
    if (codeViewB) codeViewB.classList.remove('analyzing');

    // 4. Transición a la Lógica (Regla Recursiva - 25s para explicar)
    goToScene(3);
    const codeViewC = document.querySelector('#scene-c .code-view');
    if (codeViewC) codeViewC.classList.add('analyzing');
    await new Promise(r => setTimeout(r, 25000));
    if (codeViewC) codeViewC.classList.remove('analyzing');

    // 5. Transición al Veredicto Final
    goToScene(4);
    // AQUÍ SE DETIENE LA AUTOMATIZACIÓN: EL USUARIO DEBE PRESIONAR EL BOTÓN MANUALMENTE
}

// -- Initialization --
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-mission-btn');
    const diagBtn = document.getElementById('diagBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const bar = document.getElementById('intro-bar');
            let p = 0;
            const i = setInterval(() => {
                p += 5; if (bar) bar.style.width = p + '%';
                if (p >= 100) { 
                    clearInterval(i); 
                    startAutomatedSequence(); 
                }
            }, 30)
        });
    }

    if (diagBtn) {
        diagBtn.addEventListener('click', () => {
            const container = document.querySelector('.db-visual-container');
            const pctLabel = document.getElementById('load-pct');
            const searching = document.getElementById('searching');
            if (container) container.classList.add('active-sync');
            
            let count = 0;
            const interval = setInterval(() => {
                count += Math.floor(Math.random() * 2) + 1; // Un poco más lento
                if (count >= 100) { count = 100; clearInterval(interval); }
                if (pctLabel) pctLabel.innerText = count;

                if (searching) {
                    searching.classList.remove('hidden');
                    if (count < 30) searching.innerText = "ACCEDIENDO A LA BASE DE DATOS DEDUCTIVA...";
                    else if (count < 60) searching.innerText = "COMPILANDO HECHOS PYDATALOG...";
                    else if (count < 90) searching.innerText = "BUSCANDO RUTAS RECURSIVAS...";
                    else searching.innerText = "VALIDANDO INTEGRIDAD DE NODO...";
                }
            }, 100); // 100ms * 100 steps = ~10 segundos de carga

            setTimeout(() => {
                diagActive = true;
                if (container) container.classList.remove('active-sync');
                if (searching) searching.classList.add('hidden');
                document.getElementById('query-result').classList.remove('hidden');
            }, 11000); // Coincide con la barra de carga
        });
    }



    window.addEventListener('resize', resize);
    resize(); draw(); updateScenes();
});



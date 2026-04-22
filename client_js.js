const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxsjiko1gXPneCtXlyv7ql3wdRQtWYZJJAjC2DwP1wyRRi4zhIFShVzsKlu54wNMNfl/exec";

window.onload = function() {
    actualizar();
    setInterval(actualizar, 300000); // 5 min
};

async function actualizar() {
    try {
        // Usamos el parámetro read=viajes y full=true que ya tienes en tu main.gs
        const resp = await fetch(`${WEB_APP_URL}?read=viajes&full=true&v=${new Date().getTime()}`);
        const viajes = await resp.json();
        renderizar(viajes);
    } catch (e) {
        console.error("Error cargando monitor:", e);
    }
}

function renderizar(viajes) {
    const tbody = document.getElementById('lista-viajes');
    tbody.innerHTML = "";
    let ruta = 0, retraso = 0;

    if (!viajes || viajes.length === 0 || viajes.error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay viajes activos.</td></tr>';
        return;
    }

    viajes.forEach(v => {
        if (v.estado === "EN CURSO") ruta++;
        if (v.minutosDesv > 15) retraso++;

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${v.placa}</b></td>
            <td>${v.ruta}</td>
            <td>
                <div style="background:#eee; height:8px; border-radius:4px; width:100%;">
                    <div style="background:#2ecc71; height:100%; border-radius:4px; width:${v.progreso}%"></div>
                </div>
                <small>${v.progreso}%</small>
            </td>
            <td class="${v.minutosDesv > 15 ? 'retraso-critico' : ''}">${v.desviacion}</td>
            <td>${v.odoActual}</td>
            <td><button class="btn-accion" onclick="verDetalle('${v.itinerario.replace(/'/g, "\\'")}')">📋</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('count-ruta').innerText = ruta;
    document.getElementById('count-retraso').innerText = retraso;
    document.getElementById('perc-cumplimiento').innerText = (viajes.length > 0 ? (((viajes.length - retraso) / viajes.length) * 100).toFixed(0) : 100) + "%";
}

function verDetalle(itiRaw) {
    const panel = document.getElementById('side-panel');
    const content = document.getElementById('timeline-content');
    panel.classList.add('open');
    const iti = JSON.parse(itiRaw);
    content.innerHTML = iti.map(p => `
        <div style="margin-bottom:15px; border-left:2px solid #1a73e8; padding-left:10px;">
            <b>${p.punto}</b><br><small>Planificado: ${p.eta || '---'}</small>
        </div>
    `).join('');
}

function cerrarPanel() { document.getElementById('side-panel').classList.remove('open'); }

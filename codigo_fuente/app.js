// app.js - Lógica global para el Frontend Multi-Página

function initSession() {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    // Validar que el usuario haya pasado por el login (excepto si estamos en index.html)
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
    
    if (!role && !isLoginPage) {
        // Redirigir al login si no hay sesion
        window.location.href = 'index.html';
        return;
    }

    // Actualizar visualización del usuario si los elementos existen
    const userDisplay = document.getElementById('user-display');
    const roleDisplay = document.getElementById('role-display');
    
    if (userDisplay && roleDisplay) {
        userDisplay.textContent = username;
        roleDisplay.textContent = role.toUpperCase();
    }

    // Aplicar lógica de Perfiles (Roles)
    aplicarRoles(role);
}

function aplicarRoles(role) {
    if (role === 'corredor') {
        // Un corredor no puede eliminar y su filtro de origen está fijo en su propio rol
        const btnEliminar = document.getElementById('btn-eliminar');
        const filtroOrigenContainer = document.getElementById('filtro-origen-container');
        
        if (btnEliminar) btnEliminar.style.display = 'none';
        if (filtroOrigenContainer) filtroOrigenContainer.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Custom Modal function (replaces native alert)
function showModal(title, message, type = 'info', onConfirm = null) {
    // Remove existing if any
    const existing = document.getElementById('custom-modal');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-modal';
    overlay.className = 'custom-modal-overlay';
    
    // type determines header color (error, success, info)
    overlay.innerHTML = `
        <div class="custom-modal-box">
            <div class="custom-modal-header ${type}">
                <span>${title}</span>
                <span style="cursor:pointer;" onclick="this.closest('.custom-modal-overlay').remove()">✕</span>
            </div>
            <div class="custom-modal-body">
                ${message}
            </div>
            <div class="custom-modal-footer">
                <button class="btn btn-primary" id="modal-btn-ok">Aceptar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('modal-btn-ok').addEventListener('click', () => {
        overlay.remove();
        if(onConfirm) onConfirm();
    });
}

// ==========================================
// CORE LÓGICA: BASE DE DATOS Y AUDITORÍA (MIGRADO A BACKEND)
// ==========================================

const API_BASE_URL = 'https://localhost:3000/api';

async function registrarAuditoria(accion, detalle) {
    // La auditoría ahora se hace en el backend automáticamente en transacciones,
    // pero dejamos la función por compatibilidad visual o si se necesita.
    console.log('Auditoria enviada al backend:', accion, detalle);
}

function generarLlave(row) {
    return `${row.ej}-${row.mercado || row.ori}-${row.ins}-${row.sec}`;
}

async function grabarDatosSeguros(newDataArray) {
    const user = localStorage.getItem('username') || 'SISTEMA';
    const role = localStorage.getItem('role') || 'UNKNOWN';

    try {
        const response = await fetch(`${API_BASE_URL}/calificaciones/grabar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ datos: newDataArray, usuario: user, perfil: role })
        });
        
        if (!response.ok) {
            throw new Error('Error en el servidor al grabar datos');
        }
        
        const result = await response.json();
        return result; // { insertados, rechazados }
    } catch (error) {
        console.error('Error fetch:', error);
        return { insertados: 0, rechazados: 0, error: true };
    }
}

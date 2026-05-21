// 2. Gestión de Servicios (Entradas/Salidas)
class ParkingManager extends HTMLElement {
    connectedCallback() { this.render(); }
    render() {
        const types = storage.get('vehicleTypes');
        const services = storage.get('parkingServices').filter(s => !s.exitTime);
        
        this.innerHTML = `
            <div class="card">
                <h3>Nuevo Registro de Entrada</h3>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <input type="text" id="plate" placeholder="Placa (ABC123)" style="flex:1">
                    <select id="typeId" style="flex:1">
                        ${types.map(t => `<option value="${t.code}">${t.name} (Q${t.rate}/h)</option>`).join('')}
                    </select>
                    <input type="text" id="slot" placeholder="Estacionamiento   (N°)" style="flex:1">
                    <button id="btnReg">Registrar</button>
                </div>
            </div>
            <div class="card">
                <h3>Vehículos Actuales</h3>
                <table>
                    <thead><tr><th>Placa</th><th>Tipo</th><th>Slot</th><th>Ingreso</th><th>Acciones</th></tr></thead>
                    <tbody>
                        ${services.map(s => {
                            const typeName = types.find(t => t.code === s.typeCode)?.name || 'N/A';
                            return `<tr>
                                <td><b>${s.plate}</b></td>
                                <td>${typeName}</td>
                                <td>${s.slot}</td>
                                <td>${new Date(s.entryTime).toLocaleTimeString()}</td>
                                <td><button class="danger" onclick="document.querySelector('parking-manager').checkOut('${s.plate}')">Salida</button></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.querySelector('#btnReg').onclick = () => this.registerEntry();
    }
}           

// 3. Gestión de Tarifas (Edición)
class ConfigManager extends HTMLElement {
    connectedCallback() { this.render(); }
    render() {
        const types = storage.get('vehicleTypes');
        this.innerHTML = `
            <div class="card">
                <h3>Gestión de Tipos de Vehículo</h3>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="tc" placeholder="Código">
                    <input type="text" id="tn" placeholder="Nombre (ej. Camión)">
                    <input type="number" id="tr" placeholder="Tarifa/h">
                    <button id="btnAddT">Guardar</button>
                </div>
                <table>
                    <thead><tr><th>Cód</th><th>Nombre</th><th>Tarifa/h</th><th>Acción</th></tr></thead>
                    <tbody>
                        ${types.map(t => `<tr>
                            <td>${t.code}</td>
                            <td>${t.name}</td>
                            <td>Q${t.rate}</td>
                            <td><button class="danger" onclick="deleteT('${t.code}')">X</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.querySelector('#btnAddT').onclick = () => {
            const types = storage.get('vehicleTypes');
            types.push({ code: this.querySelector('#tc').value, name: this.querySelector('#tn').value, rate: this.querySelector('#tr').value });
            storage.save('vehicleTypes', types);
            this.render();
        };
    }
}


// 4.  Perfil
class ProfileModal extends HTMLElement {
    connectedCallback() {
        this.render();
    }
    render() {
        const user = JSON.parse(localStorage.getItem('user'));
        this.innerHTML = `
            <div class="modal-overlay" id="ovl">
                <div class="modal-content">
                    <h3>Mi Perfil</h3>
                    <label>Nombre:</label><input type="text" id="p-name" value="${user.name}"><br>
                    <label>Email:</label><input type="email" id="p-email" value="${user.email}"<br>
                    <label>Contraseña:</label><input type="password" id="p-pass" value="${user.pass}">
                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <button id="p-save">Actualizar</button>
                        <button class="secondary" id="p-close">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        this.querySelector('#p-save').onclick = () => {
            localStorage.setItem('user', JSON.stringify({
                name: this.querySelector('#p-name').value,
                email: this.querySelector('#p-email').value,
                pass: this.querySelector('#p-pass').value
            }));
            alert("Perfil actualizado correctamente");
            this.toggle(false);
        };
        this.querySelector('#p-close').onclick = () => this.toggle(false);
    }
    toggle(show) { this.querySelector('#ovl').style.display = show ? 'flex' : 'none'; }
}

// Barra de menu hamburguesa 
customElements.define('login-view', LoginView);
customElements.define('parking-manager', ParkingManager);
customElements.define('config-manager', ConfigManager);
customElements.define('profile-modal', ProfileModal);

const app = document.getElementById('app');

window.addEventListener('login-ok', () => {
    app.innerHTML = `
        <div class="main-container">
            <div class="sidebar">
                <div class="brand">PARKING</div>
                <div class="menu-item active" id="m-reg">📋 Registro</div>
                <div class="menu-item" id="m-money">📈Historial</div>
                <div class="menu-item" id="m-edit">⚙️ Tipo de vehiculo</div>
                <div class="menu-item" id="m-prof"> 👤 Perfil</div>
                <div class="menu-item" onclick="location.reload()" style="margin-top:auto; color:#fffff">🚪 Salir</div>
            </div>
            <div class="content" id="view">
                <parking-manager></parking-manager>
            </div>
        </div>
        <profile-modal id="modal"></profile-modal>
    `;

// Funcion del menu
const updateActive = (id) => {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};

document.getElementById('m-reg').onclick = (e) => {
    updateActive('m-reg');
    document.getElementById('view').innerHTML = '<parking-manager></parking-manager>';
};

document.getElementById('m-edit').onclick = (e) => {
    updateActive('m-edit');
    document.getElementById('view').innerHTML = '<config-manager></config-manager>';
};

document.getElementById('m-money').onclick = (e) => {
    updateActive('m-money');
    const history = storage.get('parkingServices').filter(s => s.exitTime);
    const total = history.reduce((acc, s) => acc + s.total, 0);
    document.getElementById('view').innerHTML = `
        <div class="card">
            <h2>Total Ganancias: <span style="color:green">$${total}</span></h2>
            <p>Histórico de servicios finalizados:</p>
            <table>
                <thead><tr><th>Placa</th><th>Entrada</th><th>Salida</th><th>Total</th></tr></thead>
                <tbody>${history.map(h => `<tr><td>${h.plate}</td><td>${new Date(h.entryTime).toLocaleTimeString()}</td><td>${new Date(h.exitTime).toLocaleTimeString()}</td><td>$${h.total}</td></tr>`).join('')}</tbody>
            </table>
        </div>`;
};

document.getElementById('m-prof').onclick = () => {
    document.getElementById('modal').toggle(true);
   };
});

window.deleteT = (code) => {
const types = storage.get('vehicleTypes').filter(t => t.code !== code);
storage.save('vehicleTypes', types);
document.querySelector('config-manager').render();
};

storage.init();
app.innerHTML = '<login-view></login-view>';
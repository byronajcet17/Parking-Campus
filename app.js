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
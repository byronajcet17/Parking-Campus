// DATOS
const storage = {
    get(key) { return JSON.parse(localStorage.getItem(key)) || []; },
    save(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
    init() {
        if (!localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify({name: 'BYRON', email: 'byronajcet@gmail.com', pass: 'BYRON12'}));
        }
        if (this.get('vehicleTypes').length === 0) {
            this.save('vehicleTypes', [
                {code: '01', name: 'Moto', rate: '2'},
                {code: '02', name: 'Automóvil', rate: '5'},
                {code: '03', name: 'Camioneta', rate: '8'},
                {code: '04', name: 'Camión', rate: '15'}
            ]);
        }
    }
};



// Login
class LoginView extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div style="display:grid; place-items:center; height:100vh;">
                <div class="card" style="width:350px; text-align:center;">
                    <h2 style="color:var(--primary-blue)">ParkEasy</h2>
                    <p>Ingresa tus datos</p>
                    <input type="email" id="l-email" placeholder="Email">
                    <input type="password" id="l-pass" placeholder="Contraseña">
                    <button id="btnLogin" style="width:100%; margin-top:10px;">Iniciar Sesión</button>
                </div>
            </div>
        `;
        this.querySelector('#btnLogin').onclick = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            const email = this.querySelector('#l-email').value;
            const pass = this.querySelector('#l-pass').value;
            if(email === user.email && pass === user.pass) {
                window.dispatchEvent(new CustomEvent('login-ok'));
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        };
    }
}
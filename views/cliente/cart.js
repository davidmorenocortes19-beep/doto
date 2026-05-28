// 🛒 OBTENER CARRITO
function obtenerCarrito(){
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// 💾 GUARDAR CARRITO
function guardarCarrito(carrito){
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ❌ ELIMINAR PRODUCTO
function eliminarDelCarrito(index){
    let carrito = obtenerCarrito();

    carrito.splice(index, 1);

    guardarCarrito(carrito);
    mostrarCarrito();
}

// 🔢 CAMBIAR CANTIDAD
function cambiarCantidad(index, cantidad){

    let carrito = obtenerCarrito();

    carrito[index].cantidad = parseInt(cantidad);

    guardarCarrito(carrito);
    mostrarCarrito();
}

// 🧮 MOSTRAR CARRITO
function mostrarCarrito(){

    let carrito = obtenerCarrito();

    let contenedor = document.querySelector(".carrito-productos");
    let totalContenedor = document.querySelector(".carrito-total");

    if(!contenedor || !totalContenedor) return;

    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach((p, index) => {

        let subtotal = p.precio * (p.cantidad || 1);
        total += subtotal;

        contenedor.innerHTML += `
        <div class="carrito-item">
            <div class="item-info">
                <p class="nombre">${p.nombre}</p>
                <p class="detalle">Talla: ${p.talla} | Color: ${p.color}</p>
                <p class="precio">$${p.precio}</p>
            </div>

            <div class="item-acciones">
                <input type="number" value="${p.cantidad || 1}" min="1"
                    onchange="cambiarCantidad(${index}, this.value)">
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">✖</button>
            </div>
        </div>
        `;
    });

    // 🔥 AQUÍ SE CREA EL TOTAL Y EL BOTÓN
    totalContenedor.innerHTML = `
        <h4>Total: $${total}.000</h4>
        <button class="btn-pagar" onclick="pagar()">Proceder al Pago</button>
    `;
}

// 💳 SIMULAR PAGO
function pagar(){

    let carrito = obtenerCarrito();

    if(carrito.length === 0){
        alert("Carrito vacío ❌");
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    let nuevoPedido = {
        id: Date.now(),
        productos: carrito,
        fecha: new Date().toLocaleDateString(),
        estado: "Por pagar"
    };

    pedidos.push(nuevoPedido);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    localStorage.removeItem("carrito");

    alert("Pedido creado 📦");

    mostrarCarrito();
}

// ➕ AGREGAR AL CARRITO
function agregarAlCarrito(index){

    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    // 🔒 VALIDAR SESIÓN
    if(!usuario){
        alert("Debes iniciar sesión para comprar ❌");
        window.location.href = "Login.php";
        return;
    }

    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const carrito = obtenerCarrito();

    const producto = productos[index];

    // 🔥 EVITAR DUPLICADOS
    const existe = carrito.find(p => p.id === producto.id);

    if(existe){
        existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
        producto.cantidad = 1;
        carrito.push(producto);
    }

    guardarCarrito(carrito);

    alert("Producto agregado 🛒");

    mostrarCarrito();
}

// 🔥 AUTO CARGAR
window.addEventListener("load", mostrarCarrito);
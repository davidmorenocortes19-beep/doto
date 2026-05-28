<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Pedidos</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <script src="../../assets/javascript/session.js"></script>
    <script src="cart.js"></script>
</head>
<body>

<header class="header">

    <div class="menu container">
        <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">

        <input type="checkbox" id="menu">
        <label for="menu" class="menu-icono">☰</label>

        <nav class="navbar">
            <ul>
                <li><a href="index_cliente.php">Inicio</a></li>
                <li><a href="perfil_cliente.php">Perfil</a></li>
                <li><a href="productos_cliente.php">Productos</a></li>
                <li><a href="verpedidos_cliente.php">Ver Pedidos</a></li>
                <li><a href="nosotros_cliente.php">Nosotros</a></li>
                <li><a href="#" onclick="cerrarSesion()">Cerrar Sesion</a></li>
                <div class="carrito-icono">
    <input type="checkbox" id="toggle-carrito">
    <label for="toggle-carrito" class="icono-carrito-btn">🛒</label>

    <div class="carrito-panel">

    <div class="carrito-header">
        <h3>Mi Carrito</h3>
        <label for="toggle-carrito" class="cerrar-carrito">✖</label>
    </div>

        <div class="carrito-productos">

        </div>
        <div class="carrito-total">

        </div>
    </div>
            </ul>
        </nav>
    </div>

    <div class="header-content container">
        <div class="header-txt">
            <h1>Mis Pedidos</h1>
            <p>Consulta el estado de tus pedidos y gestiona tus compras.</p>
        </div>
    </div>

</header>

<section class="pedidos-section container" id="contenedorPedidos">

</section>

<script>

// 🔥 OBTENER PEDIDOS
function obtenerPedidos(){
    return JSON.parse(localStorage.getItem("pedidos")) || [];
}

// 🔥 MOSTRAR PEDIDOS
function mostrarPedidos(){

    const pedidos = obtenerPedidos();
    const contenedor = document.getElementById("contenedorPedidos");

    contenedor.innerHTML = "";

    if(pedidos.length === 0){
        contenedor.innerHTML = "<p>No tienes pedidos aún 🛒</p>";
        return;
    }

    

    pedidos.forEach((pedido, index) => {

        let total = 0;
        let productosHTML = "";

        pedido.productos.forEach(p => {

            let subtotal = p.precio * (p.cantidad || 1);
            total += subtotal;

            productosHTML += `
                <div class="producto-item">
                    <p><strong>Producto:</strong> ${p.nombre}</p>
                    <p><strong>Precio:</strong> $${p.precio}</p>
                    <p><strong>Cantidad:</strong> ${p.cantidad || 1}</p>
                </div>
            `;
        });

        // 🔥 mostrar botón SOLO si no está pagado
        let botonPagar = pedido.estado === "Por pagar"
    ? `<button class="btn-pagar" onclick="terminarPago(${index})">Terminar de pagar</button>`
    : "";

        let botonEliminar = pedido.estado === "Pagado"
    ? `<button class="btn-eliminar" onclick="eliminarPedido(${index})">Eliminar</button>`
    : "";

        contenedor.innerHTML += `
        <div class="pedido-card">

            <div class="pedido-header">
                <h3>Pedido #${index + 1}</h3>
                <span class="estado ${pedido.estado === "Por pagar" ? "por-pagar" : "entregado"}">
                    ${pedido.estado}
                </span>
            </div>

            <p class="fecha">Fecha: ${pedido.fecha}</p>

            <div class="pedido-productos">
                ${productosHTML}
            </div>

            <div class="pedido-footer">
                <h4>Total: $${total}.000</h4>

                <div class="pedido-acciones">
                    ${botonPagar}
                    ${botonEliminar}
                    <button class="btn-factura">Ver Factura</button>
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-devolucion">Devolución</button>
                </div>
            </div>

        </div>
        `;
    });
}

// 🔥 TERMINAR PAGO
function terminarPago(index){

    let pedidos = obtenerPedidos();

    pedidos[index].estado = "Pagado";

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Pago completado ✅");

    mostrarPedidos();
}

function eliminarPedido(index){

    let pedidos = obtenerPedidos();

    let confirmar = confirm("¿Eliminar este pedido?");
    if(!confirmar) return;

    pedidos.splice(index, 1);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Pedido eliminado 🗑️");

    mostrarPedidos();
}

// 🔥 INICIO
window.onload = mostrarPedidos;

</script>
</body>
</html>
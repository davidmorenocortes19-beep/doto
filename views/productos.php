<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dotaciones Toronto</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <script src="../assets/javascript/session.js"></script>
    <script src="cliente/cart.js"></script>
</head>
<body>
    <header class="header">
        <div class="menu container">
            <img src="../assets/imagenes/Logo de la empresa.png" class="logo" title="Logo de la empresa">
            <input type="checkbox" id="menu">
<label for="menu" class="menu-icono">☰</label>
            <nav class="navbar">
            <ul>
                <li><a href="../index.php">Inicio</a></li>
                <li><a href="Login.php">Login</a></li>
                <li><a href="productos.php">Productos</a></li>
                <li><a href="registro.php">Registro</a></li>
                <li><a href="nosotros.php">Nosotros</a></li>
            </ul>
</div>
            </ul>
            </nav>
        </div>
        <div class="header-content container">
            <div class="header-txt">
                <h1>Productos</h1>
                <p>
                    En nuestro almacén de dotaciones, 
                    ofrecemos una amplia gama de productos de equipos 
                    de protección y uniformes para diferentes sectores, 
                    como la industria, la construcción, la salud, y más. 
                    Contamos con productos de alta calidad que garantizan 
                    seguridad, comodidad y durabilidad para los clientes. 
                </p>

        </div>
        </div>

    </header>

    <section class="productos-section">

    <h2 class="titulo-productos">Nuestros Productos</h2>

    <div class="productos-container" id="contenedorProductos">

    </div>

</section>

    <footer class="footer container">

        <div class="footer-content">

            <div class="footer-form">
                <h2>Contactanos</h2>
                <h1>Si tienes una duda o un reclamo de nuestro productos porfavor llenar el siguiente formulario con tus datos</h1>
                <form>
                    <input type="text" class="campo" placeholder="Nombre">
                    <input type="email" class="campo" placeholder="Correo">
                    <textarea class="campo" placeholder="Mensaje"  cols="30" rows="10"></textarea>
                    <input class="btn-2" type="submit" value="enviar">

                </form>
            </div>
            <div class="footer-txt">
                <h3>+57 3212099989</h3>
                <p>dotaciones.elobrero@gmail.com</p>
                <p>Carrera 63 Sur #21-12, Bogotá D.C., Colombia.</p>
            </div>

            <div class="footer-hours">
    <h4>Horario de Atencion</h4>
    <p>Lunes a Viernes: 8am - 6pm</p>
    <p>Sábado: 9am - 2pm</p>
    <p>Domingo: Cerrado</p>

</div> 
        </div>

        <div class="footer-2">
            <p>Dotaciones Toronto 2026</p>
        </div>

    </footer>
    <script>

// 🔥 OBTENER PRODUCTOS DEL ADMIN
function obtenerProductos(){
    return JSON.parse(localStorage.getItem("productos")) || [];
}

// 🔥 MOSTRAR PRODUCTOS
function mostrarProductos(){

    const productos = obtenerProductos();
    const contenedor = document.getElementById("contenedorProductos");

    contenedor.innerHTML = "";

    if(productos.length === 0){
        contenedor.innerHTML = "<p>No hay productos disponibles</p>";
        return;
    }

    productos.forEach((p, index) => {

        contenedor.innerHTML += `
        <div class="producto-card">

            <img src="../assets/imagenes/camiseta.png" alt="producto">

            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio}</p>

            <p><span>Talla:</span> ${p.talla}</p>
            <p><span>Color:</span> ${p.color}</p>

            <p class="estado ${p.estado === "Disponible" ? "disponible" : "agotado"}">
                ${p.estado}
            </p>

            <button 
                onclick="agregarAlCarrito(${index})"
                ${p.estado === "Agotado" ? "disabled" : ""}
            >
                ${p.estado === "Agotado" ? "Agotado" : "Agregar al carrito"}
            </button>

        </div>
        `;
    });
}

// 🛒 CARRITO
function obtenerCarrito(){
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito){
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// 🔥 AGREGAR AL CARRITO
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

// 🔥 INICIO
window.onload = mostrarProductos;

</script>
</body>
</php>
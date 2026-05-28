<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <script src="../../assets/javascript/session.js"></script>
    <script src="cart.js"></script>
</head>
<body class="body-perfil">

<header class="header-register">

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

</header>

<section class="perfil-section">

    <div class="perfil-card">

        <h2>Mi Perfil</h2>

        <!-- INFO -->
        <div class="perfil-info">
            <h3>Información Personal</h3>

            <div class="perfil-datos" id="datosPerfil">
                
            </div>
        </div>

        <!-- FORM -->
        <div class="perfil-form">
            <h3>Actualizar Información</h3>

            <input class="controls" id="nuevoNombre" type="text" placeholder="Nuevo Nombre">
<input class="controls" id="nuevoCorreo" type="email" placeholder="Nuevo Correo">
<input class="controls" id="nuevoTelefono" type="tel" placeholder="Nuevo Teléfono">
<input class="controls" id="nuevaDireccion" type="text" placeholder="Nueva Dirección">
<input class="controls" id="nuevoPassword" type="password" placeholder="Nueva Contraseña">

<input class="btn-editar" type="button" value="Guardar Cambios" onclick="actualizarPerfil()">
        </div>

    </div>

</section>

<script>

// 🔥 OBTENER USUARIO ACTIVO
function obtenerUsuarioActivo(){
    return JSON.parse(localStorage.getItem("usuarioActivo"));
}

// 🔥 MOSTRAR PERFIL
function mostrarPerfil(){

    const user = obtenerUsuarioActivo();

    if(!user){
        alert("No hay sesión activa ❌");
        window.location.href = "../Login.html";
        return;
    }

    const contenedor = document.getElementById("datosPerfil");

    contenedor.innerHTML = `
        <p><span>Nombre:</span> ${user.nombre}</p>
        <p><span>Documento:</span> ${user.documento}</p>
        <p><span>Correo:</span> ${user.correo}</p>
        <p><span>Teléfono:</span> ${user.telefono}</p>
        <p><span>Dirección:</span> ${user.direccion}</p>
    `;
}

// 🔥 ACTUALIZAR PERFIL
function actualizarPerfil(){

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let user = obtenerUsuarioActivo();

    if(!user){
        alert("Error ❌");
        return;
    }

    let nuevoNombre = document.getElementById("nuevoNombre").value;
    let nuevoCorreo = document.getElementById("nuevoCorreo").value;
    let nuevoTelefono = document.getElementById("nuevoTelefono").value;
    let nuevaDireccion = document.getElementById("nuevaDireccion").value;
    let nuevoPassword = document.getElementById("nuevoPassword").value;

    // buscar usuario en la lista
    let index = usuarios.findIndex(u => u.correo === user.correo);

    if(index === -1){
        alert("Usuario no encontrado ❌");
        return;
    }

    // actualizar solo si hay datos nuevos
    if(nuevoNombre) usuarios[index].nombre = nuevoNombre;
    if(nuevoCorreo) usuarios[index].correo = nuevoCorreo;
    if(nuevoTelefono) usuarios[index].telefono = nuevoTelefono;
    if(nuevaDireccion) usuarios[index].direccion = nuevaDireccion;
    if(nuevoPassword) usuarios[index].password = nuevoPassword;

    // guardar cambios
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // actualizar usuario activo
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarios[index]));

    alert("Perfil actualizado ✅");

    mostrarPerfil();
}

// 🔥 INICIO
window.onload = mostrarPerfil;

</script>

</body>
</html>
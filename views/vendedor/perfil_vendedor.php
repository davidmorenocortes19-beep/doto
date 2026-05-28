<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <script src="../../assets/javascript/session.js"></script>
</head>
<body class="body-perfil">

<header class="header-register">

    <div class="menu container">
        <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">

        <input type="checkbox" id="menu">
        <label for="menu" class="menu-icono">☰</label>

        <nav class="navbar">
            <ul>
                <li><a href="index_vendedor.php">Inicio</a></li>
                <li><a href="perfil_vendedor.php">Perfil</a></li>
                <li><a href="#">Ver Pedidos</a></li>
                <li><a href="#">Ver Ventas</a></li>
                <li><a href="#">Devoluciones</a></li>
                <li><a href="#" onclick="cerrarSesion()">Cerrar Sesion</a></li>
            </ul>
            </nav>
    </div>

</header>

<section class="perfil-section">

    <div class="perfil-card">

        <h2>Mi Perfil</h2>

        
        <div class="perfil-info">
            <h3>Información Personal</h3>

            <div class="perfil-datos" id="datosPerfil">
                
            </div>
        </div>

       
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

function obtenerUsuarioActivo(){
    return JSON.parse(localStorage.getItem("usuarioActivo"));
}


function mostrarPerfil(){

    const user = obtenerUsuarioActivo();

    if(!user){
        alert("No hay sesión activa ❌");
        window.location.href = "../Login.php";
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

    
    let index = usuarios.findIndex(u => u.correo === user.correo);

    if(index === -1){
        alert("Usuario no encontrado ❌");
        return;
    }

    
    if(nuevoNombre) usuarios[index].nombre = nuevoNombre;
    if(nuevoCorreo) usuarios[index].correo = nuevoCorreo;
    if(nuevoTelefono) usuarios[index].telefono = nuevoTelefono;
    if(nuevaDireccion) usuarios[index].direccion = nuevaDireccion;
    if(nuevoPassword) usuarios[index].password = nuevoPassword;

    
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarios[index]));

    alert("Perfil actualizado ✅");

    mostrarPerfil();
}


window.onload = mostrarPerfil;

</script>

</body>
</html>
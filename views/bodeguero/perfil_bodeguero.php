<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title class="title1">Dotaciones Toronto</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>
    <header class="header">

        <div class="menu container">
            <img src="../../assets/imagenes/Logo de la empresa.png" class="logo" title="Logo de la empresa">
            <input type="checkbox" id="menu">
<label for="menu" class="menu-icono">☰</label>
            <nav class="navbar">
            <ul>
                <li><a href="index_bodeguero.php">Inicio</a></li>
                <li><a href="perfil_bodeguero.php">Perfil</a></li>
                <li><a href="inventario_bodeguero.php">Inventario</a></li>
                <li><a href="../login.php">Cerrar Sesión</a></li>
            </ul>
            </nav>
        </div>

    <div class="perfil-card-bodeguero">

        <h2>Mi Perfil</h2>

       
        <div class="perfil-info">
            <h3>Información Personal</h3>

            <div class="perfil-datos">
            <p id="perfilNombre">Nombre</p>
            <p id="perfilCorreo">Correo</p>
            <p id="perfilTelefono">Teléfono</p>
            <p id="perfilDireccion">Dirección</p>
            <p id="perfilDocumento">Documento</p>
            <p id="perfilRol">Rol</p>
            </div>
        </div>

        
        <div class="perfil-form">
            <h3>Actualizar Información</h3>

            <input id="nuevoNombre" class="controls" type="text" placeholder="Nuevo Nombre">
            <input id="nuevoCorreo" class="controls" type="email" placeholder="Nuevo Correo">
            <input id="nuevoTelefono" class="controls" type="text" placeholder="Nuevo Telefono">
            <input id="nuevaDireccion" class="controls" type="text" placeholder="Nueva Direccion">
            <input id="nuevaPassword" class="controls" type="password" placeholder="Nueva Contraseña">
            
            <button onclick="actualizarPerfil()">Actualizar</button>
        </div>

    </div>

</section>

<script>
function cargarPerfil() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.length === 0) return;

  let usuario = usuarios[usuarios.length - 1]; // último registrado

  document.getElementById("perfilNombre").textContent = usuario.nombre;
  document.getElementById("perfilCorreo").textContent = usuario.correo;
  document.getElementById("perfilTelefono").textContent = usuario.telefono;
  document.getElementById("perfilDireccion").textContent = usuario.direccion;
  document.getElementById("perfilDocumento").textContent = usuario.documento;
  document.getElementById("perfilRol").textContent = usuario.rol;
}

window.onload = cargarPerfil;
</script>

<script>
function actualizarPerfil() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.length === 0) return;

  let usuario = usuarios[usuarios.length - 1];

  document.getElementById("nuevoNombre").textContent = usuario.nombre;
  document.getElementById("nuevoCorreo").textContent = usuario.correo;
  document.getElementById("nuevoTelefono").textContent = usuario.telefono;
  document.getElementById("nuevaDireccion").textContent = usuario.direccion;
  document.getElementById("nuevaPassword").textContent = usuario.password;

  let nuevoNombre = document.getElementById("nuevoNombre").value;
  let nuevoCorreo = document.getElementById("nuevoCorreo").value;
  let nuevoTelefono = document.getElementById ("nuevoTelefono").value;
  let nuevaDireccion = document.getElementById ("nuevaDireccion").value;
  let nuevaPassword = document.getElementById ("nuevaPassword").value;

  if (nuevoNombre) usuario.nombre = nuevoNombre;
  if (nuevoCorreo) usuario.correo = nuevoCorreo;
  if (nuevoTelefono) usuario.telefono = nuevoTelefono;
  if (nuevaDireccion) usuario.direccion = nuevaDireccion;
  if (nuevaPassword) usuario.password = nuevaPassword;
  

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  cargarPerfil(); // refresca la card
}

localStorage.setItem("usuarioActivo", usuario);
</script>
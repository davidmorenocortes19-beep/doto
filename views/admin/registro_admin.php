<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dotaciones Toronto</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>

<body class="body-register">

<header class="header-register">
    <div class="menu container">
        <img src="../assets/imagenes/Logo de la empresa.png" class="logo">
        <input type="checkbox" id="menu">
        <label for="menu" class="menu-icono">☰</label>

        <nav class="navbar">
            <ul>
                <li><a href="index_admin.php">Inicio</a></li>
                <li><a href="ListaUsuario.php">Usuarios</a></li>
                <li><a href="productosAdmin.php">Productos</a></li>
                <li><a href="verpedidos_admin.php">Ver Pedidos</a></li>
                <li><a href="inventario_admin.php">Inventario</a></li>
                <li><a href="devoluciones_admin.php">Devoluciones</a></li>
                <li><a href="#">Cerrar Sesion</a></li>
            </ul>
        </nav>
    </div>
</header>

<section class="registro-section">

    <form class="form-register" action="../controllers/UsuarioControlador.php" method="POST">

        <h4>Formulario Registro</h4>

       
        <input class="controls" name="nombre" id="nombre" type="text" placeholder="Ingrese su Nombre" required>
        <input class="controls" name="documento" id="documento" type="text" placeholder="Ingrese su Documento" required>
        <input class="controls" name="correo" id="correo" type="email" placeholder="Ingrese su Correo" required>
        <input class="controls" name="telefono" id="telefono" type="tel" placeholder="Ingrese su telefono" required>
        <input class="controls" name="direccion" id="direccion" type="text" placeholder="Ingrese su Dirección" required>
        <input class="controls" name="password" id="password" type="password" placeholder="Ingrese su Contraseña" required>
        <select class="controls" name="rol" id="rol" required>
            <option value="">Seleccione su Rol</option>
            <option value="1">Administrador</option>
            <option value="2">Cliente</option>
            <option value="3">Vendedor</option>
            <option value="4">Bodeguero</option>
        </select>
        <input type="hidden" name="accion" value="crearUsuarioAdmin">

        <p>Estoy de acuerdo con <a href="#">Términos y condiciones</a></p>

    
        <button class="botons" type="submit">Registrar</button>

        <p><a href="Login.php">¿Ya tengo cuenta?</a></p>

    </form>

</section>

<script>
function registrar(event){
    event.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let documento = document.getElementById("documento").value;
    let correo = document.getElementById("correo").value;
    let telefono = document.getElementById("telefono").value;
    let direccion = document.getElementById("direccion").value;
    let password = document.getElementById("password").value;
    let rol = document.getElementById("rol").value;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let existe = usuarios.find(u => u.correo === correo);

    if(existe){
        alert("Este correo ya está registrado ❌");
        return;
    }

    let nuevoUsuario = {
        nombre,
        documento,
        correo,
        telefono,
        direccion,
        password,
        rol
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro exitoso 🎉");

   
    document.querySelector("form").reset();

    window.location.href = "Login.php";
}
</script>

</body>
</html>
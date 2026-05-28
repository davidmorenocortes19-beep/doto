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
                <li><a href="../index.php">Inicio</a></li>
                <li><a href="Login.php">Login</a></li>
                <li><a href="productos.php">Productos</a></li>
                <li><a href="registro.php">Registro</a></li>
                <li><a href="nosotros.php">Nosotros</a></li>
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

        <p>Estoy de acuerdo con <a href="#">Términos y condiciones</a></p>
        <input type="hidden" name="accion" value="registro">
    
        <button class="botons" type="submit">Registrar</button>

        <p><a href="Login.php">¿Ya tengo cuenta?</a></p>

    </form>

</section>

</body>
</html>
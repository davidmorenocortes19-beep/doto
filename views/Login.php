<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dotaciones Toronto</title>
    <link rel="stylesheet" href="../assets/css/style.css">

</head>
<body>
    <header class="header-login">

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
            </nav>
            </header>

        <section class="login-section">
    <div class="wrapper">
    <form action="../controllers/UsuarioControlador.php" method="POST">

    <h1>Inicio de Sesión</h1>

    <div class="input-box">
        <input type="email" name="correo" id="correo" placeholder="Correo" required>
    </div>

    <div class="input-box">
        <input type="password" name="password" id="password" placeholder="Contraseña" required>
    </div>

    <input type="hidden" name="accion" value="login">

    <button type="submit" class="btn">Acceso</button>

    <div class="register-link">
        <p>¿No tienes cuenta? <a href="registro.php">Regístrate</a></p>
    </div>

</form>


</div>
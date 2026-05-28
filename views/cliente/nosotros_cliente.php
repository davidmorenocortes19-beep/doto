<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dotaciones Toronto</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <script src="../../assets/javascript/session.js"></script>
    <script src="cart.js"></script>
</head>
<body>
    <header class="header">

        <div class="menu container">
            <img src="../../assets/imagenes/Logo de la empresa.png" class="logo" title="Logo de la empresa">
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
            </ul>
            </nav>

        </div>
        <section id="Mision">
        <div class="header-content container">
            <div class="header-txt">
                <h1>Misión</h1>
                <p>
                    Nuestra misión es actuar como un aliado
                    estratégico de las empresas e industrias colombianas
                    que buscan proteger a sus trabajadores con productos
                    diseñados para resistir, proteger y facilitar el desempeño
                    diario en entornos de alto riesgo o demanda física. 
                    Nos enfocamos en crear dotaciones que no solo cumplan
                    con los estándares técnicos y normativos de seguridad,
                    sino que también contribuyan al bienestar físico y emocional
                    del trabajador al brindar comodidad y funcionalidad.
                </p>
                <a href="#Vision" class="btn-1">Visión</a>

        </div>
        </div>
        </section>
    </header>

    <section id="Vision" class="about container">
        <div class="about-img">
            <img src="../../assets/imagenes/nosotros.jpg" alt="Productos de el negocio">

        </div>
        <div class="about-txt">
            <h2>Visión</h2>
            <p>
                Nuestra visión se proyecta hacia una meta clara y alcanzable:
                posicionarnos en los próximos años como un referente dentro
                del mercado bogotano de dotaciones industriales.
                En una ciudad tan diversa y dinámica como Bogotá,
                buscamos diferenciarnos no solo por el volumen de producción,
                sino por el valor agregado que ofrecemos: productos
                de excelente calidad, atención personalizada y una 
                filosofía centrada en el bienestar y la seguridad 
                del trabajador.
            </p>
            <a href="#Mision" class="btn-1">Misión</a>
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
</body>
</html>
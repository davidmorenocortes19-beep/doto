<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Productos</title>

<style>
body {
    margin: 0;
    font-family: sans-serif;

    background: linear-gradient(
        rgba(0,0,0,0.8),
        rgba(0,0,0,0.8)
    ),
    url("../../assets/imagenes/camiseta.png");

    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

/* CONTENEDOR */
.admin-panel{
  display:flex;
}

/* SIDEBAR */
.sidebar{
  width:250px;
  min-height:100vh;
  background:#000;
  padding:20px;
}

/* LOGO */
.logo{
  width:100%;
  margin-bottom:10px;
}

/* TITULO PRODUCTOS (ABAJO DEL LOGO) */
.sidebar h2{
  color:#B7975b;
  text-align:center;
  font-size:20px;
  margin-bottom:30px;
}

.titulo{
  text-align:center;
  font-size:24px;
  color:#B7975b;
  margin-bottom:20px;
}

/* MENÚ */
.sidebar ul{
  list-style:none;
  padding:0;
}

.sidebar ul li{
  margin-bottom:10px;
}

.sidebar ul li a{
  display:block;
  color:white;
  text-decoration:none;
  padding:12px;
  border-radius:5px;
  transition:0.3s;
}

.sidebar ul li a:hover{
  background:#B7975b;
  color:rgb(255, 255, 255);
}

/* CONTENIDO */
.content{
  flex:1;
  padding:30px;
}

/* TARJETA */
.card{
  background:rgb(29, 27, 27);
  padding:20px;
  border-radius:10px;
  color:rgb(255, 255, 255);
}

/* TABLA */
table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#B7975b;
  color:rgb(0, 0, 0);
}

th,td{
  border:1px solid #ccc;
  padding:10px;
  text-align:center;
}

/* BOTONES */
button{
  padding:6px 10px;
  border:none;
  cursor:pointer;
}

.btn-edit{background:orange;}
.btn-delete{background:red;color:white;}
.btn-add{
  background:#B7975b;
  margin-bottom:15px;
}

.buscador{
  position: relative;
  margin-bottom: 15px;
  width: 250px;
  margin-left: auto;
    align-items: center;
    
}

.buscador input{
  width: 100%;
  padding: 10px 40px 10px 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  box-sizing: border-box;
}

.buscador .icono{
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: black;
    align-items: center;
}

.top-bar{
  display: flex;
  justify-content: flex-end; /* 🔥 lo alinea a la derecha */
  margin-bottom: 15px;
  align-items: center;
}

</style>

</head>

<body>

<div class="admin-panel">

  <!-- 🔥 SIDEBAR -->
  <aside class="sidebar">
    <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">

    <!-- 👇 TITULO AQUÍ (debajo del logo) -->
    <h2>Productos</h2>

    <ul>
      <li><a href="index_admin.php">Inicio</a></li>
      <li><a href="ListaUsuario.php">Usuarios</a></li>
      <li><a href="verpedidos_admin.php">Pedidos</a></li>
      <li><a href="inventario_admin.php">Inventario</a></li>
      <li><a href="devoluciones_admin.php">Devoluciones</a></li>
      <li><a href="../Login.php">Cerrar Sesión</a></li>
    </ul>
  </aside>

  <!-- 🔥 CONTENIDO -->
  <main class="content">

    <div class="card">

          <h2 class="titulo">Productos</h2>

         <div class="buscador">
      <input type="text" id="searchInput" placeholder="Buscar..." onkeyup="buscarTabla()">
    <button class="icono" onclick="buscarTabla()">🔍</button>
    </div>

      <button class="btn-add" onclick="agregarProducto()">Agregar Producto</button>

 <table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Precio</th>
      <th>Talla</th>
      <th>Color</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>

  <tbody id="tablaProductos">
    
  </tbody>
</table>

    </div>

  </main>

</div>

<script>

// 🔥 CARGAR PRODUCTOS
function cargarProductos(){
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let tabla = document.getElementById("tablaProductos");

    tabla.innerHTML = "";

    productos.forEach((p, index) => {
        tabla.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${p.nombre}</td>
            <td>$${p.precio}</td>
            <td>${p.talla}</td>
            <td>${p.color}</td>

            <td>
                <select onchange="cambiarEstado(${index}, this.value)">
                    <option value="Disponible" ${p.estado === "Disponible" ? "selected" : ""}>Disponible</option>
                    <option value="Agotado" ${p.estado === "Agotado" ? "selected" : ""}>Agotado</option>
                </select>
            </td>

            <td>
                <button class="btn-edit" onclick="editarProducto(${index})">Editar</button>
                <button class="btn-delete" onclick="eliminarProducto(${index})">Eliminar</button>
            </td>
        </tr>
        `;
    });
}

// 🔥 AGREGAR PRODUCTO
function agregarProducto(){

    let nombre = prompt("Nombre del producto:");
    let precio = prompt("Precio:");
    let talla = prompt("Talla:");
    let color = prompt("Color:");
    let estado = prompt("Estado (Disponible/Agotado):");

    if(!nombre || !precio){
        alert("Datos obligatorios ❌");
        return;
    }

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos.push({
        id: Date.now(),
        nombre,
        precio,
        talla,
        color,
        estado: estado || "Disponible"
    });

    localStorage.setItem("productos", JSON.stringify(productos));

    cargarProductos();
}

// 🔥 EDITAR
function editarProducto(index){

    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let p = productos[index];

    let nombre = prompt("Nombre:", p.nombre);
    let precio = prompt("Precio:", p.precio);
    let talla = prompt("Talla:", p.talla);
    let color = prompt("Color:", p.color);

    productos[index] = {
        ...p,
        nombre,
        precio,
        talla,
        color
    };

    localStorage.setItem("productos", JSON.stringify(productos));
    cargarProductos();
}

// 🔥 CAMBIAR ESTADO
function cambiarEstado(index, estado){
    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos[index].estado = estado;

    localStorage.setItem("productos", JSON.stringify(productos));
}

// 🔥 ELIMINAR
function eliminarProducto(index){
    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    if(confirm("¿Eliminar producto?")){
        productos.splice(index, 1);
        localStorage.setItem("productos", JSON.stringify(productos));
        cargarProductos();
    }
}

// 🔥 BUSCADOR
function buscarTabla(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filas = document.querySelectorAll("#tablaProductos tr");

    filas.forEach(fila => {
        let texto = fila.innerText.toLowerCase();
        fila.style.display = texto.includes(input) ? "" : "none";
    });
}

// 🔥 INICIO
window.onload = cargarProductos;

</script>

</body>
</html>


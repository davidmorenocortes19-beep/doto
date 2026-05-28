<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Devoluciones</title>

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

.admin-panel{
  display:flex;
}

.sidebar{
  width:250px;
  min-height:100vh;
  background:#000;
  padding:20px;
}

.logo{
  width:100%;
  display:block;
  margin:0 auto 10px auto;
}

.sidebar h2{
  color:#B7975b;
  text-align:center;
  font-size:20px;
  margin-bottom:30px;
}

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
}

.sidebar ul li a:hover{
  background:#B7975b;
  color:black;
}

.content{
  flex:1;
  padding:30px;
}

.card{
  background:rgb(29,27,27);
  padding:20px;
  border-radius:10px;
  color:white;
}

.titulo{
  text-align:center;
  font-size:24px;
  color:#B7975b;
  margin-bottom:20px;
}

table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#B7975b;
  color:black;
}

th,td{
  border:1px solid #ccc;
  padding:10px;
  text-align:center;
}

.btn-add{
  background:#B7975b;
  padding:8px;
  margin-bottom:15px;
  border:none;
  cursor:pointer;
}

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
  justify-content: flex-end; 
  margin-bottom: 15px;
  align-items: center;
}

</style>

</head>
<body>

<div class="admin-panel">

  <aside class="sidebar">
    <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">
    <h2>Devoluciones</h2>

    <ul>
      <li><a href="index_admin.php">Inicio</a></li>
      <li><a href="ListaUsuario.php">Usuarios</a></li>
      <li><a href="productosAdmin.php">Productos</a></li>
      <li><a href="verpedidos_admin.php">Pedidos</a></li>
      <li><a href="inventario_admin.php">Inventario</a></li>
      <li><a href="../Login.php">Cerrar Sesión</a></li>
    </ul>
  </aside>

  <main class="content">

    <div class="card">
      <h2 class="titulo">Devoluciones</h2>

      <div class="buscador">
      <input type="text" id="searchInput" placeholder="Buscar..." onkeyup="buscarTabla()">
    <button class="icono" onclick="buscarTabla()">🔍</button>
    </div>

      <button class="btn-add" onclick="agregarDevolucion()">Registrar Devolución</button>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>ID Venta</th>
      <th>Cantidad</th>
      <th>Motivo</th>
      <th>Fecha</th>
      <th>Acciones</th>
    </tr>
  </thead>

    <tr>
      <td>1</td>
      <td>10</td>
      <td>2</td>
      <td>Talla incorrecta</td>
      <td>2026-04-03</td>
      <td>
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </td>
    </tr>

    <tr>
      <td>2</td>
      <td>15</td>
      <td>1</td>
      <td>Producto defectuoso</td>
      <td>2026-04-02</td>
      <td>
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </td>
    </tr>
  </tbody>
</table>

    </div>

  </main>

</div>

<script>


function cargarDevoluciones(){
    let devoluciones = JSON.parse(localStorage.getItem("devoluciones")) || [];
    let tabla = document.getElementById("tablaDevoluciones");

    tabla.innerHTML = "";

    devoluciones.forEach((d, index) => {
        tabla.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${d.idVenta}</td>
            <td>${d.cantidad}</td>
            <td>${d.motivo}</td>
            <td>${d.fecha}</td>

            <td>
                <button class="btn-edit" onclick="editarDevolucion(${index})">Editar</button>
                <button class="btn-delete" onclick="eliminarDevolucion(${index})">Eliminar</button>
            </td>
        </tr>
        `;
    });
}

function agregarDevolucion(){

    let idVenta = prompt("ID de la venta:");
    let cantidad = prompt("Cantidad:");
    let motivo = prompt("Motivo:");
    let fecha = prompt("Fecha (YYYY-MM-DD):");

    if(!idVenta || !cantidad){
        alert("Datos obligatorios ❌");
        return;
    }

    let devoluciones = JSON.parse(localStorage.getItem("devoluciones")) || [];

    devoluciones.push({
        idVenta,
        cantidad,
        motivo,
        fecha
    });

    localStorage.setItem("devoluciones", JSON.stringify(devoluciones));

    cargarDevoluciones();
}


function editarDevolucion(index){

    let devoluciones = JSON.parse(localStorage.getItem("devoluciones")) || [];
    let d = devoluciones[index];

    let idVenta = prompt("ID Venta:", d.idVenta);
    let cantidad = prompt("Cantidad:", d.cantidad);
    let motivo = prompt("Motivo:", d.motivo);
    let fecha = prompt("Fecha:", d.fecha);

    devoluciones[index] = {
        idVenta,
        cantidad,
        motivo,
        fecha
    };

    localStorage.setItem("devoluciones", JSON.stringify(devoluciones));
    cargarDevoluciones();
}


function eliminarDevolucion(index){
    let devoluciones = JSON.parse(localStorage.getItem("devoluciones")) || [];

    if(confirm("¿Eliminar devolución?")){
        devoluciones.splice(index, 1);
        localStorage.setItem("devoluciones", JSON.stringify(devoluciones));
        cargarDevoluciones();
    }
}


function buscarTabla(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filas = document.querySelectorAll("#tablaDevoluciones tr");

    filas.forEach(fila => {
        let texto = fila.innerText.toLowerCase();
        fila.style.display = texto.includes(input) ? "" : "none";
    });
}


window.onload = cargarDevoluciones;

</script>


</body>
</html>
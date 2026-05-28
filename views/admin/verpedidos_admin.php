<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Pedidos</title>

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

/* BOTONES */
button{
  padding:6px 10px;
  border:none;
  cursor:pointer;
}

.btn-add{
  background:#B7975b;
  margin-bottom:15px;
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

select{
  padding:5px;
}
</style>

</head>
<body>

<div class="admin-panel">

  <aside class="sidebar">
    <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">
    <h2>Pedidos</h2>

    <ul>
      <li><a href="index_admin.php">Inicio</a></li>
      <li><a href="ListaUsuario.php">Usuarios</a></li>
      <li><a href="productosAdmin.php">Productos</a></li>
      <li><a href="inventario_admin.php">Inventario</a></li>
      <li><a href="devoluciones_admin.php">Devoluciones</a></li>
      <li><a href="../Login.php">Cerrar Sesión</a></li>
    </ul>
  </aside>

  <main class="content">

    <div class="card">
      <h2 class="titulo">Pedidos</h2>

<button class="btn-add" onclick="agregarPedido()">Agregar Pedido</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody id="tablaPedidos"></tbody>
          <tr>
            <td>1</td>
            <td>Juan</td>
            <td>Camisa</td>
            <td>2</td>
            <td>
              <select>
                <option>Pendiente</option>
                <option>Enviado</option>
                <option>Entregado</option>
              </select>
            </td>
          </tr>

          <tr>
            <td>2</td>
            <td>Ana</td>
            <td>Pantalón</td>
            <td>1</td>
            <td>
              <select>
                <option>Enviado</option>
                <option>Pendiente</option>
                <option>Entregado</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </main>

</div>

<script>

// 🔥 CARGAR PEDIDOS
function cargarPedidos(){
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    let tabla = document.getElementById("tablaPedidos");

    tabla.innerHTML = "";

    pedidos.forEach((p, index) => {
        tabla.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${p.cliente}</td>
            <td>${p.producto}</td>
            <td>${p.cantidad}</td>

            <td>
                <select onchange="cambiarEstado(${index}, this.value)">
                    <option ${p.estado==="Pendiente"?"selected":""}>Pendiente</option>
                    <option ${p.estado==="Enviado"?"selected":""}>Enviado</option>
                    <option ${p.estado==="Entregado"?"selected":""}>Entregado</option>
                </select>
            </td>

        </tr>
        `;
    });
}

// 🔥 AGREGAR PEDIDO
function agregarPedido(){

    let cliente = prompt("Cliente:");
    let producto = prompt("Producto:");
    let cantidad = prompt("Cantidad:");

    if(!cliente || !producto){
        alert("Datos obligatorios ❌");
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos.push({
        cliente,
        producto,
        cantidad,
        estado: "Pendiente"
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    cargarPedidos();
}


// 🔥 CAMBIAR ESTADO
function cambiarEstado(index, estado){
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos[index].estado = estado;

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
}


// 🔥 INICIO
window.onload = cargarPedidos;

</script>

</body>
</html>
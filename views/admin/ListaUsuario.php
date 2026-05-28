<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Usuarios</title>

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

/* LOGO CENTRADO */
.logo{
  display:block;
  margin:0 auto 10px auto;
  width:120px;
}

/* TITULO */
.sidebar h2{
  color:#B7975b;
  text-align:center;
  font-size:18px;
  margin-bottom:25px;
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
  color:black;
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

/* TITULO CENTRAL */
.titulo{
  text-align:center;
  font-size:24px;
  color:#B7975b;
  margin-bottom:20px;
}

/* TABLA */
table{
  width:100%;
  border-collapse:collapse;
  background:rgb(29, 27, 27);
  color:rgb(255, 255, 255);
  border-radius:10px;
  overflow:hidden;
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

.btn-edit{
  background:orange;
}

.btn-delete{
  background:red;
  color:white;
}

select{
  padding:5px;
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

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <img src="../../assets/imagenes/Logo de la empresa.png" class="logo">
    <h2>Panel Admin</h2>

    <ul>
      <li><a href="index_admin.php">Inicio</a></li>
      <li><a href="ListaUsuario.php">Usuarios</a></li>
      <li><a href="productosAdmin.php">Productos</a></li>
      <li><a href="verpedidos_admin.php">Pedidos</a></li>
      <li><a href="inventario_admin.php">Inventario</a></li>
      <li><a href="devoluciones_admin.php">Devoluciones</a></li>
      <li><a href="../Login.php">Cerrar Sesión</a></li>
    </ul>
  </aside>

  <!-- CONTENIDO -->
  <main class="content">

    <section id="usuarios">
      <div class="card">

        <h2 class="titulo">Usuarios</h2>

       <div class="buscador">
      <input type="text" id="searchInput" placeholder="Buscar..." onkeyup="buscarTabla()">
    <button class="icono" onclick="buscarTabla()">🔍</button>
    </div>

        <button class="btn-add" onclick="agregarUsuario()">Agregar Usuario</button>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Documento</th>
      <th>Correo</th>
      <th>Teléfono</th>
      <th>Dirección</th>
      <th>Rol</th>
      <th>Acciones</th>
    </tr>
  </thead>

  <tbody id="tablaUsuarios"></tbody>
    <tr>
      <td>1</td>
      <td>Juan</td>
      <td>123456789</td>
      <td>juan@gmail.com</td>
      <td>3001234567</td>
      <td>Calle 10 #20-30</td>
      <td>
        <select>
          <option>Administrador</option>
          <option>Cliente</option>
          <option>Vendedor</option>
          <option>Bodeguero</option>
        </select>
      </td>
      <td>
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </td>
    </tr>

    <tr>
      <td>2</td>
      <td>Maria</td>
      <td>987654321</td>
      <td>maria@gmail.com</td>
      <td>3019876543</td>
      <td>Carrera 5 #15-40</td>
      <td>
        <select>
          <option>Cliente</option>
          <option>Administrador</option>
          <option>Vendedor</option>
          <option>Bodeguero</option>
        </select>
      </td>
      <td>
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </td>
    </tr>
  </tbody>
</table>

      </div>
    </section>

  </main>

</div>

<script>

// 🔥 CARGAR USUARIOS
function cargarUsuarios(){
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let tabla = document.getElementById("tablaUsuarios");

    tabla.innerHTML = "";

    usuarios.forEach((u, index) => {
        tabla.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${u.nombre}</td>
            <td>${u.documento}</td>
            <td>${u.correo}</td>
            <td>${u.telefono}</td>
            <td>${u.direccion}</td>

            <td>
                <select onchange="cambiarRol(${index}, this.value)">
                    <option value="admin" ${u.rol === "admin" ? "selected" : ""}>Administrador</option>
                    <option value="cliente" ${u.rol === "cliente" ? "selected" : ""}>Cliente</option>
                    <option value="vendedor" ${u.rol === "vendedor" ? "selected" : ""}>Vendedor</option>
                    <option value="bodeguero" ${u.rol === "bodeguero" ? "selected" : ""}>Bodeguero</option>
                </select>
            </td>

            <td>
                <button class="btn-edit" onclick="editarUsuario(${index})">Editar</button>
                <button class="btn-delete" onclick="eliminarUsuario(${index})">Eliminar</button>
            </td>
        </tr>
        `;
    });
}

// 🔥 AGREGAR USUARIO
function agregarUsuario(){

    let nombre = prompt("Nombre:");
    let documento = prompt("Documento:");
    let correo = prompt("Correo:");
    let telefono = prompt("Teléfono:");
    let direccion = prompt("Dirección:");
    let rol = prompt("Rol (admin, cliente, vendedor, bodeguero):");

    if(!nombre || !correo){
        alert("Datos obligatorios ❌");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    usuarios.push({
        nombre,
        documento,
        correo,
        telefono,
        direccion,
        rol: rol || "cliente",
        password: "1234" // opcional
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    cargarUsuarios();
}

// 🔥 EDITAR
function editarUsuario(index){

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let u = usuarios[index];

    let nombre = prompt("Nombre:", u.nombre);
    let documento = prompt("Documento:", u.documento);
    let correo = prompt("Correo:", u.correo);
    let telefono = prompt("Teléfono:", u.telefono);
    let direccion = prompt("Dirección:", u.direccion);

    usuarios[index] = {
        ...u,
        nombre,
        documento,
        correo,
        telefono,
        direccion
    };

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

// 🔥 CAMBIAR ROL
function cambiarRol(index, rol){
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    usuarios[index].rol = rol;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// 🔥 ELIMINAR
function eliminarUsuario(index){
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if(confirm("¿Eliminar usuario?")){
        usuarios.splice(index, 1);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        cargarUsuarios();
    }
}

// 🔥 BUSCADOR
function buscarTabla(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filas = document.querySelectorAll("#tablaUsuarios tr");

    filas.forEach(fila => {
        let texto = fila.innerText.toLowerCase();
        fila.style.display = texto.includes(input) ? "" : "none";
    });
}

// 🔥 INICIO
window.onload = cargarUsuarios;

</script>

</body>
</html>
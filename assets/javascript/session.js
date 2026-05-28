// 🔒 VERIFICAR SESIÓN
function verificarSesion(){
    let usuario = localStorage.getItem("usuarioActivo");

    if(!usuario){
        alert("Debes iniciar sesión ❌");
        window.location.href = "../../views/Login.html";
    }
}

// 🚪 CERRAR SESIÓN
function cerrarSesion(){

    localStorage.removeItem("usuarioActivo");

    alert("Sesión cerrada 👋");

    window.location.href = "../../index.html";
}
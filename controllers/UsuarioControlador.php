<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

define('BASE_PATH', dirname(__DIR__));

require_once BASE_PATH . '/models/Usuario.php';

class UsuarioControlador {

    // REGISTRO PUBLICO
    public function registrar() {

        if ($_POST) {

            $resultado = Usuario::registrar(
                $_POST['nombre'],
                $_POST['documento'],
                $_POST['correo'],
                $_POST['telefono'],
                $_POST['direccion'],
                $_POST['password']
            );

            if($resultado == "exist"){
                echo "El documento ya existe";
                return;
            }

            header("location:../views/Login.php");
            exit;
        }

        require BASE_PATH . '/views/registro.php';
    }

    // CREAR USUARIO DESDE ADMIN
    public function crearUsuarioAdmin() {

        if($_POST){

            $resultado = Usuario::crearUsuarioAdmin(
                $_POST['nombre'],
                $_POST['documento'],
                $_POST['correo'],
                $_POST['telefono'],
                $_POST['direccion'],
                $_POST['password'],
                $_POST['rol']
            );

            if($resultado == "exist"){
                echo "El documento ya existe";
                return;
            }

            header("location:../views/ListaUsuario.php");
            exit;
        }

        require BASE_PATH . '/views/agregar_usuario.php';
    }

    // LOGIN
    public function login(){

        session_start();

        if($_POST){

            $usuario = Usuario::login(
                $_POST['correo'],
                $_POST['password']
            );

            if($usuario){

                $_SESSION['id'] = $usuario['id_usuario'];
                $_SESSION['nombre'] = $usuario['nombre'];
                $_SESSION['rol'] = $usuario['nombre_rol'];

                // REDIRECCION POR ROL
                switch($usuario['nombre_rol']){

                    case 'Administrador':
                        header("Location: ../views/admin/index_admin.php");
                        break;

                    case 'Cliente':
                        header("Location: ../views/cliente/index_cliente.php");
                        break;

                    case 'Vendedor':
                        header("Location: ../views/vendedor/index_vendedor.php");
                        break;

                    case 'Bodeguero':
                        header("Location: ../views/bodeguero/index_bodeguero.php");
                        break;

                    default:
                        echo "Rol no válido";
                }

                exit;

            }else{
                echo "Correo o contraseña incorrectos";
            }
        }

        require BASE_PATH . '/views/Login.php';
    }
}

// EJECUTAR ACCIONES
$controlador = new UsuarioControlador();

if(isset($_POST['accion'])){

    switch($_POST['accion']){

        case 'registro':
            $controlador->registrar();
            break;

        case 'login':
            $controlador->login();
            break;

        case 'crearUsuarioAdmin':
            $controlador->crearUsuarioAdmin();
            break;
    }

}else{
    $controlador->registrar();
}
?>
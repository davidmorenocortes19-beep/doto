<?php 

require_once BASE_PATH . '/core/Database.php';

class Usuario { 

    // REGISTRO PUBLICO 
    public static function registrar($nombre, $documento, $correo, $telefono, $direccion, $password) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT documento FROM usuario WHERE documento = ?");
        $stmt->execute([$documento]);

        if($stmt->fetch()){
            return "exist";
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO usuario
            (nombre, documento, correo, telefono, direccion, password)
            VALUES (?,?,?,?,?,?)
        ");

        return $stmt->execute([
            $nombre,
            $documento,
            $correo,
            $telefono,
            $direccion,
            $hash
        ]);
    }

    // CREAR USUARIO DESDE ADMIN
    public static function crearUsuarioAdmin($nombre, $documento, $correo, $telefono, $direccion, $password, $rol) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT documento FROM usuario WHERE documento = ?");
        $stmt->execute([$documento]);

        if($stmt->fetch()){
            return "exist";
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO usuario
            (nombre, documento, correo, telefono, direccion, password, id_rol_fk)
            VALUES (?,?,?,?,?,?,?)
        ");

        return $stmt->execute([
            $nombre,
            $documento,
            $correo,
            $telefono,
            $direccion,
            $hash,
            $rol
        ]);
    }

    public static function login($correo, $password){

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT usuario.*, rol.nombre_rol
            FROM usuario
            INNER JOIN rol
            ON usuario.id_rol_fk = rol.id_rol
            WHERE correo = ?
        ");

        $stmt->execute([$correo]);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if($usuario && password_verify($password, $usuario['password'])){
        return $usuario;
        }

        return false;
    }
}
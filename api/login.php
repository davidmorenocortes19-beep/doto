<?php
require_once 'config.php';
require_once BASE_PATH . '/core/DataBase.php';
require_once BASE_PATH . '/models/Usuario.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "mensaje" => "Datos incompletos"]);
    exit;
}

$user = Usuario::login($data['username'], $data['password']);

if ($user) {
    echo json_encode([
        "success" => true,
        "rol"     => $user['nombre_rol'],
        "usuario" => [
            "id"     => $user['id_usuario'],
            "nombre" => $user['nombre'],
            "correo" => $user['correo'],
            "rol"    => $user['nombre_rol']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "mensaje" => "Credenciales incorrectas"]);
}
?>
<?php
require_once 'config.php';
require_once BASE_PATH . '/core/DataBase.php';
require_once BASE_PATH . '/models/Usuario.php';

$data = json_decode(file_get_contents("php://input"), true);

$nombre    = trim($data["nombre"]    ?? "");
$documento = trim($data["documento"] ?? "");
$correo    = trim($data["correo"]    ?? "");
$telefono  = trim($data["telefono"]  ?? "");
$direccion = trim($data["direccion"] ?? "");
$password  = $data["password"]       ?? "";
$rolNombre = trim($data["rol"]       ?? "Cliente");

if (!$nombre || !$documento || !$correo || !$telefono || !$direccion || !$password) {
    echo json_encode(["success" => false, "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "mensaje" => "Correo no válido"]);
    exit;
}

$db = DataBase::conectar();
$stmtRol = $db->prepare("SELECT id_rol FROM rol WHERE LOWER(nombre_rol) = LOWER(?)");
$stmtRol->execute([$rolNombre]);
$rolData = $stmtRol->fetch(PDO::FETCH_ASSOC);

if (!$rolData) {
    echo json_encode(["success" => false, "mensaje" => "Rol no válido: " . $rolNombre]);
    exit;
}

$idRol = $rolData['id_rol'];

$resultado = Usuario::crearUsuarioAdmin(
    $nombre,
    $documento,
    $correo,
    $telefono,
    $direccion,
    $password,
    $idRol
);

if ($resultado === "exist") {
    echo json_encode(["success" => false, "mensaje" => "El documento o correo ya está registrado"]);
} elseif ($resultado === true) {
    echo json_encode(["success" => true, "mensaje" => "Usuario registrado correctamente"]);
} else {
    echo json_encode(["success" => false, "mensaje" => "Error al registrar el usuario"]);
}

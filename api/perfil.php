<?php
require_once 'config.php';
require_once BASE_PATH . '/core/DataBase.php';
require_once BASE_PATH . '/models/Usuario.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["success" => false, "mensaje" => "Datos incompletos"]);
    exit;
}

$id       = $data['id'];
$campos   = [];
$valores  = [];

if (!empty($data['nombre']))    { $campos[] = "nombre = ?";    $valores[] = trim($data['nombre']); }
if (!empty($data['correo']))    { $campos[] = "correo = ?";    $valores[] = trim($data['correo']); }
if (!empty($data['telefono']))  { $campos[] = "telefono = ?";  $valores[] = trim($data['telefono']); }
if (!empty($data['direccion'])) { $campos[] = "direccion = ?"; $valores[] = trim($data['direccion']); }
if (!empty($data['password']))  { $campos[] = "password = ?";  $valores[] = password_hash($data['password'], PASSWORD_DEFAULT); }

if (empty($campos)) {
    echo json_encode(["success" => false, "mensaje" => "No hay campos para actualizar"]);
    exit;
}

$valores[] = $id;

$db  = DataBase::conectar();
$sql = "UPDATE usuario SET " . implode(", ", $campos) . " WHERE id_usuario = ?";
$stmt = $db->prepare($sql);
$stmt->execute($valores);

if ($stmt->rowCount() > 0) {
    // Devolver los datos actualizados
    $stmtGet = $db->prepare("SELECT id_usuario as id, nombre, documento, correo, telefono, direccion FROM usuario WHERE id_usuario = ?");
    $stmtGet->execute([$id]);
    $usuario = $stmtGet->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "mensaje" => "Perfil actualizado", "data" => $usuario]);
} else {
    echo json_encode(["success" => false, "mensaje" => "No se realizaron cambios"]);
}
?>

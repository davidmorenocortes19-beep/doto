<?php
header('Content-Type: application/json');
require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

header('Content-Type: application/json'); // ✅ Agrega esta línea
header('Access-Control-Allow-Origin: *'); // ✅ Por si hay problemas de CORS
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$metodo = $_SERVER['REQUEST_METHOD'];
if ($metodo !== 'PUT' && $metodo !== 'POST') {
    responder(405, ['error' => 'Método no permitido']);
}

$body = json_decode(file_get_contents('php://input'), true);

if (empty($body['id_usuario'])) responder(400, ['error' => 'El campo id_usuario es obligatorio']);

// ✅ Documento viene del original, no se valida como editable
$requeridos = ['nombre', 'correo', 'telefono', 'direccion', 'id_rol'];
foreach ($requeridos as $campo) {
    if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
        responder(400, ['error' => "El campo '$campo' es obligatorio"]);
    }
}

if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
    responder(400, ['error' => 'El correo no tiene un formato válido']);
}

// ✅ Validar estado (opcional, si no llega se asume Habilitado)
$estado = $body['estado'] ?? 'Habilitado';
if (!in_array($estado, ['Habilitado', 'Inhabilitado'], true)) {
    responder(400, ['error' => "El campo 'estado' debe ser 'Habilitado' o 'Inhabilitado'"]);
}

// ✅ Obtener el usuario para usar su documento original
$usuario = Usuario::obtenerPorId((int) $body['id_usuario']);
if (!$usuario) responder(404, ['error' => 'Usuario no encontrado']);

$resultado = Usuario::actualizar(
    (int) $body['id_usuario'],
    trim($body['nombre']),
    $usuario['documento'],       // ✅ siempre el documento original de la BD
    trim($body['correo']),
    trim($body['telefono']),
    trim($body['direccion']),
    (int) $body['id_rol'],
    $estado                      // ✅ nuevo parámetro
);

if ($resultado === 'exist') {
    responder(409, ['error' => 'El correo ya está en uso por otro usuario']);
} elseif ($resultado) {
    responder(200, ['mensaje' => 'Datos Editados']);
} else {
    responder(500, ['error' => 'No se pudo actualizar el usuario']);
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

$metodo = $_SERVER['REQUEST_METHOD'];
if ($metodo !== 'PUT' && $metodo !== 'POST') {
    responder(405, ['error' => 'Método no permitido']);
}

$body = json_decode(file_get_contents('php://input'), true);

if (empty($body['id_usuario'])) responder(400, ['error' => 'El campo id_usuario es obligatorio']);

$requeridos = ['nombre', 'documento', 'correo', 'telefono', 'direccion', 'id_rol'];
foreach ($requeridos as $campo) {
    if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
        responder(400, ['error' => "El campo '$campo' es obligatorio"]);
    }
}

if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
    responder(400, ['error' => 'El correo no tiene un formato válido']);
}

$usuario = Usuario::obtenerPorId((int) $body['id_usuario']);
if (!$usuario) responder(404, ['error' => 'Usuario no encontrado']);

$resultado = Usuario::actualizar(
    (int) $body['id_usuario'],
    trim($body['nombre']),
    trim($body['documento']),
    trim($body['correo']),
    trim($body['telefono']),
    trim($body['direccion']),
    (int) $body['id_rol']
);

if ($resultado === 'exist') {
    responder(409, ['error' => 'El documento o correo ya están en uso por otro usuario']);
} elseif ($resultado) {
    responder(200, ['mensaje' => 'Usuario actualizado correctamente']);
} else {
    responder(500, ['error' => 'No se pudo actualizar el usuario']);
}

function responder(int $codigo, array $datos): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

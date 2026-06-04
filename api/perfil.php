<?php

require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    // ── GET: obtener datos del usuario por ?id=X ────────────────────
    case 'GET':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) {
            responder(400, ['success' => false, 'mensaje' => 'ID inválido']);
        }

        $usuario = Usuario::obtenerPorId($id);

        if ($usuario) {
            responder(200, ['success' => true, 'data' => $usuario]);
        } else {
            responder(404, ['success' => false, 'mensaje' => 'Usuario no encontrado']);
        }
        break;

    // ── PUT: actualizar datos del usuario ───────────────────────────
    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id'])) {
            responder(400, ['success' => false, 'mensaje' => 'El campo id es obligatorio']);
        }

        $id = (int) $body['id'];

        $usuario = Usuario::obtenerPorId($id);
        if (!$usuario) {
            responder(404, ['success' => false, 'mensaje' => 'Usuario no encontrado']);
        }

        // Usar valores nuevos o mantener los actuales
        $nombre    = !empty($body['nombre'])    ? trim($body['nombre'])    : $usuario['nombre'];
        $documento = $usuario['documento'];
        $correo    = !empty($body['correo'])    ? trim($body['correo'])    : $usuario['correo'];
        $telefono  = !empty($body['telefono'])  ? trim($body['telefono'])  : $usuario['telefono'];
        $direccion = !empty($body['direccion']) ? trim($body['direccion']) : $usuario['direccion'];
        $id_rol    = $usuario['id_rol_fk'];

        $resultado = Usuario::actualizar($id, $nombre, $documento, $correo, $telefono, $direccion, $id_rol);

        if (!empty($body['password'])) {
            Usuario::actualizarPassword($id, trim($body['password']));
        }

        if ($resultado === 'exist') {
            responder(409, ['success' => false, 'mensaje' => 'El correo ya está en uso']);
        } elseif ($resultado) {
            responder(200, ['success' => true, 'mensaje' => 'Perfil actualizado correctamente']);
        } else {
            responder(500, ['success' => false, 'mensaje' => 'No se pudo actualizar el perfil']);
        }
        break;

    default:
        responder(405, ['success' => false, 'mensaje' => 'Método no permitido']);
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
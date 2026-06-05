<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            $usuario = Usuario::obtenerPorId((int) $_GET['id']);
            if ($usuario) {
                // ✅ mapear campos para el tsx
                $usuario['id']  = $usuario['id_usuario'];
                $usuario['rol'] = $usuario['nombre_rol'];
                responder(200, $usuario);
            } else {
                responder(404, ['error' => 'Usuario no encontrado']);
            }
        } else {
            $lista = Usuario::listarTodos();
            $lista = array_map(function ($u) {
                $u['id']  = $u['id_usuario'];
                $u['rol'] = $u['nombre_rol'];
                return $u;
            }, $lista);
            responder(200, $lista);
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        $error = validarCampos($body, true);
        if ($error) responder(400, ['error' => $error]);

        $resultado = Usuario::crearUsuarioAdmin(
            trim($body['nombre']),
            trim($body['documento']),
            trim($body['correo']),
            trim($body['telefono']),
            trim($body['direccion']),
            trim($body['password']),
            (int) $body['id_rol']
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'El documento o correo ya están registrados']);
        } elseif ($resultado) {
            responder(201, ['mensaje' => 'Usuario creado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo crear el usuario']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_usuario'])) responder(400, ['error' => 'El campo id_usuario es obligatorio']);

        $error = validarCampos($body, false);
        if ($error) responder(400, ['error' => $error]);

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
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) responder(400, ['error' => 'ID inválido o no proporcionado']);

        $usuario = Usuario::obtenerPorId($id);
        if (!$usuario) responder(404, ['error' => 'Usuario no encontrado']);

        if (Usuario::eliminar($id)) {
            responder(200, ['mensaje' => 'Usuario eliminado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar el usuario']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function validarCampos(?array $body, bool $conPassword): ?string
{
    if (empty($body)) return 'El cuerpo de la petición está vacío';

    $requeridos = ['nombre', 'documento', 'correo', 'telefono', 'direccion', 'id_rol'];
    if ($conPassword) $requeridos[] = 'password';

    foreach ($requeridos as $campo) {
        if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio";
        }
    }

    if (!filter_var($body['correo'], FILTER_VALIDATE_EMAIL)) {
        return 'El correo no tiene un formato válido';
    }

    if ($conPassword && strlen($body['password']) < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
    }

    return null;
}

function responder(int $codigo, array $datos): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

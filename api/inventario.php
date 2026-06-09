<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Inventario.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            $inventario = Inventario::obtenerPorId((int) $_GET['id']);
            if ($inventario) {
                responder(200, $inventario);
            } else {
                responder(404, ['error' => 'Inventario no encontrado']);
            }
        } else {
            responder(200, Inventario::listarTodos());
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        if (!Inventario::productoExiste((int) $body['id_producto_fk'])) {
            responder(404, ['error' => 'Producto no encontrado']);
        }

        $resultado = Inventario::crear(
            (int) $body['id_producto_fk'],
            (int) $body['cantidad_actual'],
            (int) $body['stock_minimo']
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ese producto ya tiene inventario registrado']);
        } elseif ($resultado) {
            responder(201, ['mensaje' => 'Inventario creado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo crear el inventario']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_inventario'])) responder(400, ['error' => 'El campo id_inventario es obligatorio']);

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        $inventario = Inventario::obtenerPorId((int) $body['id_inventario']);
        if (!$inventario) responder(404, ['error' => 'Inventario no encontrado']);

        if (!Inventario::productoExiste((int) $body['id_producto_fk'])) {
            responder(404, ['error' => 'Producto no encontrado']);
        }

        $resultado = Inventario::actualizar(
            (int) $body['id_inventario'],
            (int) $body['id_producto_fk'],
            (int) $body['cantidad_actual'],
            (int) $body['stock_minimo']
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ese producto ya tiene inventario registrado']);
        } elseif ($resultado) {
            responder(200, ['mensaje' => 'Inventario actualizado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo actualizar el inventario']);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) responder(400, ['error' => 'ID inválido o no proporcionado']);

        $inventario = Inventario::obtenerPorId($id);
        if (!$inventario) responder(404, ['error' => 'Inventario no encontrado']);

        if (Inventario::eliminar($id)) {
            responder(200, ['mensaje' => 'Inventario eliminado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar el inventario']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function validarCampos(?array $body): ?string {
    if (empty($body)) return 'El cuerpo de la petición está vacío';

    foreach (['id_producto_fk', 'cantidad_actual', 'stock_minimo'] as $campo) {
        if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio";
        }

        if (!is_numeric($body[$campo])) {
            return "El campo '$campo' debe ser numérico";
        }
    }

    if ((int) $body['id_producto_fk'] <= 0) {
        return 'El producto debe ser válido';
    }

    if ((int) $body['cantidad_actual'] < 0) {
        return 'La cantidad actual no puede ser negativa';
    }

    if ((int) $body['stock_minimo'] < 0) {
        return 'El stock mínimo no puede ser negativo';
    }

    return null;
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

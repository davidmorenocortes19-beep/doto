<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Productos.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            $producto = Producto::obtenerPorId((int) $_GET['id']);
            if ($producto) {
                responder(200, $producto);
            } else {
                responder(404, ['error' => 'Producto no encontrado']);
            }
        } else {
            responder(200, Producto::listarTodos());
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        $resultado = Producto::crear(
            trim($body['nombre']),
            (float) $body['precio'],
            trim($body['talla']  ?? ''),
            trim($body['color']  ?? ''),
            trim($body['estado'] ?? 'Disponible')
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ya existe un producto con ese nombre']);
        } elseif ($resultado) {
            responder(201, ['mensaje' => 'Producto creado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo crear el producto']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_producto'])) responder(400, ['error' => 'El campo id_producto es obligatorio']);

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        $producto = Producto::obtenerPorId((int) $body['id_producto']);
        if (!$producto) responder(404, ['error' => 'Producto no encontrado']);

        $resultado = Producto::actualizar(
            (int)   $body['id_producto'],
            trim(   $body['nombre']),
            (float) $body['precio'],
            trim(   $body['talla']  ?? ''),
            trim(   $body['color']  ?? ''),
            trim(   $body['estado'] ?? 'Disponible')
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ya existe otro producto con ese nombre']);
        } elseif ($resultado) {
            responder(200, ['mensaje' => 'Producto actualizado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo actualizar el producto']);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) responder(400, ['error' => 'ID inválido o no proporcionado']);

        $producto = Producto::obtenerPorId($id);
        if (!$producto) responder(404, ['error' => 'Producto no encontrado']);

        if (Producto::eliminar($id)) {
            responder(200, ['mensaje' => 'Producto eliminado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar el producto']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function validarCampos(?array $body): ?string {
    if (empty($body)) return 'El cuerpo de la petición está vacío';

    foreach (['nombre', 'precio'] as $campo) {
        if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio";
        }
    }

    if (!is_numeric($body['precio']) || (float)$body['precio'] <= 0) {
        return 'El precio debe ser un número mayor a 0';
    }

    if (isset($body['estado']) && !in_array($body['estado'], ['Disponible', 'Agotado'])) {
        return 'El estado debe ser Disponible o Agotado';
    }

    return null;
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
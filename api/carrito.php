<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Carrito.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (empty($_GET['id_usuario'])) {
            responder(400, ['error' => 'El parámetro id_usuario es obligatorio']);
        }
        responder(200, Carrito::listarPorUsuario((int) $_GET['id_usuario']));
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_usuario']) || empty($body['id_producto'])) {
            responder(400, ['error' => 'Los campos id_usuario e id_producto son obligatorios']);
        }

        $cantidad = isset($body['cantidad']) ? (int) $body['cantidad'] : 1;
        if ($cantidad <= 0) $cantidad = 1;

        $resultado = Carrito::agregar(
            (int) $body['id_usuario'],
            (int) $body['id_producto'],
            $cantidad
        );

        if ($resultado) {
            responder(201, ['mensaje' => 'Producto agregado al carrito']);
        } else {
            responder(500, ['error' => 'No se pudo agregar el producto al carrito']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_detalle_carrito']) || !isset($body['cantidad'])) {
            responder(400, ['error' => 'Los campos id_detalle_carrito y cantidad son obligatorios']);
        }

        $resultado = Carrito::actualizarCantidad(
            (int) $body['id_detalle_carrito'],
            (int) $body['cantidad']
        );

        if ($resultado) {
            responder(200, ['mensaje' => 'Carrito actualizado']);
        } else {
            responder(500, ['error' => 'No se pudo actualizar el carrito']);
        }
        break;

    case 'DELETE':
        if (!empty($_GET['vaciar']) && !empty($_GET['id_usuario'])) {
            Carrito::vaciar((int) $_GET['id_usuario']);
            responder(200, ['mensaje' => 'Carrito vaciado']);
        }

        $id = isset($_GET['id_detalle_carrito']) ? (int) $_GET['id_detalle_carrito'] : 0;
        if ($id <= 0) responder(400, ['error' => 'ID inválido o no proporcionado']);

        if (Carrito::eliminarItem($id)) {
            responder(200, ['mensaje' => 'Producto eliminado del carrito']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar el producto']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function responder(int $codigo, array $datos): never
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

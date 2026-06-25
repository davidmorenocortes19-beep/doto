<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Devolucion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        // Productos de una venta para el formulario de devolución
        if (!empty($_GET['id_venta']) && !empty($_GET['productos'])) {
            responder(200, Devolucion::productosDeVenta((int) $_GET['id_venta']));
        }
        // Devoluciones de un usuario (cliente)
        if (!empty($_GET['id_usuario'])) {
            responder(200, Devolucion::listarPorUsuario((int) $_GET['id_usuario']));
        }
        // Todas las devoluciones (admin/vendedor)
        if (!empty($_GET['todas'])) {
            responder(200, Devolucion::listarTodas());
        }
        responder(400, ['error' => 'Parámetros insuficientes']);
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_detalle_venta']) || empty($body['cantidad']) || empty($body['motivo'])) {
            responder(400, ['error' => 'Los campos id_detalle_venta, cantidad y motivo son obligatorios']);
        }

        $resultado = Devolucion::crear(
            (int)   $body['id_detalle_venta'],
            (int)   $body['cantidad'],
            trim($body['motivo'])
        );

        if ($resultado === 'no_existe')        responder(404, ['error' => 'Detalle de venta no encontrado']);
        if ($resultado === 'cantidad_invalida') responder(400, ['error' => 'Cantidad inválida']);
        if ($resultado)                        responder(201, ['mensaje' => 'Devolución registrada correctamente']);
        responder(500, ['error' => 'No se pudo registrar la devolución']);
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_devolucion']) || empty($body['estado'])) {
            responder(400, ['error' => 'Los campos id_devolucion y estado son obligatorios']);
        }

        $resultado = Devolucion::cambiarEstado((int) $body['id_devolucion'], $body['estado']);
        if ($resultado === 'estado_invalido') responder(400, ['error' => 'Estado inválido. Use: Pendiente, Aprobada o Rechazada']);
        if ($resultado)                      responder(200, ['mensaje' => 'Estado actualizado correctamente']);
        responder(500, ['error' => 'No se pudo actualizar el estado']);
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
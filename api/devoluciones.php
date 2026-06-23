<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Devolucion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    // ── GET ───────────────────────────────────────────────────────────
    case 'GET':
        // Admin: todas las devoluciones
        if (!empty($_GET['admin'])) {
            responder(200, Devolucion::listarTodas());
        }

        // Cliente: sus devoluciones
        if (!empty($_GET['id_usuario']) && !empty($_GET['historial'])) {
            responder(200, Devolucion::listarPorUsuario((int) $_GET['id_usuario']));
        }

        // Cliente: sus ventas disponibles para devolver
        if (!empty($_GET['id_usuario'])) {
            responder(200, Devolucion::ventasPorUsuario((int) $_GET['id_usuario']));
        }

        responder(400, ['error' => 'Parámetros insuficientes']);
        break;

    // ── POST ──────────────────────────────────────────────────────────
    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_detalle_venta'])) {
            responder(400, ['error' => 'El campo id_detalle_venta es obligatorio']);
        }
        if (empty($body['cantidad']) || !is_numeric($body['cantidad'])) {
            responder(400, ['error' => 'El campo cantidad es obligatorio y debe ser numérico']);
        }
        if (empty($body['motivo'])) {
            responder(400, ['error' => 'El campo motivo es obligatorio']);
        }

        $resultado = Devolucion::crear(
            (int)    $body['id_detalle_venta'],
            (int)    $body['cantidad'],
            trim($body['motivo'])
        );

        switch ($resultado) {
            case 'detalle_no_encontrado':
                responder(404, ['error' => 'El detalle de venta no existe']);
                break;
            case 'cantidad_invalida':
                responder(400, ['error' => 'La cantidad es inválida o supera lo comprado']);
                break;
            case 'ya_existe_devolucion':
                responder(409, ['error' => 'Ya existe una devolución para este producto']);
                break;
            default:
                if ($resultado) {
                    responder(201, ['mensaje' => 'Devolución registrada correctamente', 'id_devolucion' => $resultado]);
                } else {
                    responder(500, ['error' => 'No se pudo registrar la devolución']);
                }
        }
        break;

    // ── DELETE ────────────────────────────────────────────────────────
    case 'DELETE':
        if (empty($_GET['id_devolucion'])) {
            responder(400, ['error' => 'El parámetro id_devolucion es obligatorio']);
        }

        $ok = Devolucion::eliminar((int) $_GET['id_devolucion']);
        if ($ok) {
            responder(200, ['mensaje' => 'Devolución eliminada correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar la devolución']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function responder(int $codigo, array $datos): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
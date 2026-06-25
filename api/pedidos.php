<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Pedido.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        // Admin/vendedor: listar todos los pedidos
        if (!empty($_GET['admin'])) {
            $soloOcultos = !empty($_GET['ocultos']) && $_GET['ocultos'] === '1';
            responder(200, Pedido::listarTodos($soloOcultos));
        }

        // Cliente: listar sus pedidos
        if (empty($_GET['id_usuario'])) {
            responder(400, ['error' => 'El parámetro id_usuario es obligatorio']);
        }
        responder(200, Pedido::listarPorUsuario((int) $_GET['id_usuario']));
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_usuario'])) {
            responder(400, ['error' => 'El campo id_usuario es obligatorio']);
        }

        $resultado = Pedido::crearDesdeCarrito((int) $body['id_usuario']);

        if ($resultado === 'carrito_vacio') {
            responder(400, ['error' => 'El carrito está vacío']);
        } elseif ($resultado) {
            responder(201, ['mensaje' => 'Pedido creado correctamente', 'id_pedido' => $resultado]);
        } else {
            responder(500, ['error' => 'No se pudo crear el pedido']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_pedido'])) {
            responder(400, ['error' => 'El campo id_pedido es obligatorio']);
        }

        // ── Cancelar pedido (cliente) ──────────────────────────────
        if (!empty($body['cancelar'])) {
            $resultado = Pedido::cancelar((int) $body['id_pedido']);
            if ($resultado === 'no_pendiente') {
                responder(400, ['error' => 'Solo se pueden cancelar pedidos en estado Pendiente']);
            } elseif ($resultado) {
                responder(200, ['mensaje' => 'Pedido cancelado correctamente']);
            } else {
                responder(500, ['error' => 'No se pudo cancelar el pedido']);
            }
        }

        // ── Ocultar / mostrar ──────────────────────────────────────
        if (isset($body['oculto'])) {
            $resultado = Pedido::toggleOculto((int) $body['id_pedido'], (bool) $body['oculto']);
            if ($resultado) {
                responder(200, ['mensaje' => $body['oculto'] ? 'Pedido ocultado' : 'Pedido restaurado']);
            } else {
                responder(500, ['error' => 'No se pudo actualizar el pedido']);
            }
        }

        // ── Cambiar estado ─────────────────────────────────────────
        if (!empty($body['estado'])) {
            $resultado = Pedido::cambiarEstado((int) $body['id_pedido'], $body['estado']);

            if ($resultado === 'estado_invalido') {
                responder(400, ['error' => 'Estado inválido']);
            } elseif ($resultado) {
                // Si el nuevo estado es Entregado → generar venta automáticamente
                if ($body['estado'] === 'Entregado') {
                    require_once BASE_PATH . '/models/Venta.php';
                    Venta::crearDesdePedido((int) $body['id_pedido']);
                }
                responder(200, ['mensaje' => 'Estado actualizado correctamente']);
            } else {
                responder(500, ['error' => 'No se pudo actualizar el estado']);
            }
        }

        responder(400, ['error' => 'Nada que actualizar']);
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
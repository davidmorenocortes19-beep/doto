<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Pedido.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        // Admin: listar todos los pedidos
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

        // Cambiar estado
        if (!empty($body['estado'])) {
            $resultado = Pedido::cambiarEstado((int) $body['id_pedido'], $body['estado']);
            if ($resultado === 'estado_invalido') {
                responder(400, ['error' => 'Estado inválido. Use: Pendiente, Enviado o Entregado']);
            } elseif ($resultado) {
                responder(200, ['mensaje' => 'Estado actualizado correctamente']);
            } else {
                responder(500, ['error' => 'No se pudo actualizar el estado']);
            }
        }

        // Ocultar / mostrar
        if (isset($body['oculto'])) {
            $resultado = Pedido::toggleOculto((int) $body['id_pedido'], (bool) $body['oculto']);
            if ($resultado) {
                responder(200, ['mensaje' => $body['oculto'] ? 'Pedido ocultado' : 'Pedido restaurado']);
            } else {
                responder(500, ['error' => 'No se pudo actualizar el pedido']);
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
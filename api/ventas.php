<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Venta.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        if (!empty($_GET['estadisticas'])) {
            responder(200, Venta::estadisticas());
        }
        responder(200, Venta::listarTodas());
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
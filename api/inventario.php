<?php
require_once 'config.php';
require_once BASE_PATH . '/models/inventario.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    // ── GET: obtener stock, alertas, resumen, historial, búsqueda ─────────────
    case 'GET':
        $accion = $_GET['accion'] ?? '';

        switch ($accion) {

            case 'resumen':
                responder(200, Inventario::obtenerResumen());
                break;

            case 'alertas':
                responder(200, Inventario::obtenerAlertas());
                break;

            case 'listas':
                responder(200, Inventario::obtenerListas());
                break;

            case 'stock':
                responder(200, Inventario::obtenerStock());
                break;

            case 'buscar':
                $q = trim($_GET['q'] ?? '');
                if (strlen($q) < 2) responder(400, ['error' => 'Ingresa al menos 2 caracteres.']);
                responder(200, Inventario::buscarProducto($q));
                break;

            case 'buscarCodigo':
                $q = trim($_GET['q'] ?? '');
                responder(200, Inventario::buscarPorCodigo($q));
                break;

            case 'historial':
                $desde = $_GET['fechaDesde'] ?? '';
                $hasta = $_GET['fechaHasta'] ?? '';
                $tipo  = $_GET['tipo']       ?? '';
                if (!$desde || !$hasta) responder(400, ['error' => 'Las fechas son obligatorias.']);
                responder(200, Inventario::obtenerHistorial($desde, $hasta, $tipo));
                break;

            case 'validarIntegridad':
                responder(200, Inventario::validarIntegridad());
                break;

            default:
                responder(400, ['error' => 'Acción no reconocida: ' . $accion]);
        }
        break;

    // ── POST: registrar producto ──────────────────────────────────────────────
    case 'POST':
        $body  = json_decode(file_get_contents('php://input'), true);
        $accion = $body['accion'] ?? '';

        switch ($accion) {

            case 'registrarProducto':
                $error = validarProducto($body);
                if ($error) responder(400, ['error' => $error]);

                $resultado = Inventario::registrarProducto(
                    strtoupper(trim($body['codigo'])),
                    trim($body['nombre']),
                    trim($body['unidad']  ?? 'Unidad'),
                    trim($body['grupo']   ?? 'General'),
                    (float)($body['precio']   ?? 0),
                    (int)($body['stockMin']   ?? 0)
                );

                if ($resultado['ok']) {
                    responder(201, ['mensaje' => $resultado['mensaje']]);
                } else {
                    responder(409, ['error' => $resultado['mensaje']]);
                }
                break;

            case 'registrarMovimiento':
                $error = validarMovimiento($body);
                if ($error) responder(400, ['error' => $error]);

                $resultado = Inventario::registrarMovimiento(
                    strtoupper(trim($body['codigo'])),
                    trim($body['fecha']),
                    trim($body['tipo']),
                    (float)($body['cantidad']),
                    trim($body['observaciones'] ?? '')
                );

                if ($resultado['ok']) {
                    responder(201, ['mensaje' => $resultado['mensaje']]);
                } else {
                    responder(400, ['error' => $resultado['mensaje']]);
                }
                break;

            default:
                responder(400, ['error' => 'Acción no reconocida: ' . $accion]);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

// ── Validaciones ──────────────────────────────────────────────────────────────

function validarProducto(?array $body): ?string {
    if (empty($body)) return 'El cuerpo de la petición está vacío.';

    foreach (['codigo', 'nombre', 'precio'] as $campo) {
        if (empty($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio.";
        }
    }

    if (!is_numeric($body['precio']) || (float)$body['precio'] <= 0) {
        return 'El precio debe ser un número mayor a 0.';
    }

    return null;
}

function validarMovimiento(?array $body): ?string {
    if (empty($body)) return 'El cuerpo de la petición está vacío.';

    foreach (['codigo', 'fecha', 'tipo', 'cantidad'] as $campo) {
        if (empty($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio.";
        }
    }

    $tiposValidos = ['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];
    if (!in_array($body['tipo'], $tiposValidos)) {
        return 'Tipo de movimiento no válido.';
    }

    if (!is_numeric($body['cantidad']) || (float)$body['cantidad'] <= 0) {
        return 'La cantidad debe ser mayor a 0.';
    }

    return null;
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
?>
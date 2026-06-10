<?php

// ── CORS ──────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── SESIÓN ────────────────────────────────────────────────────────────────────
session_start();

// ── PROTECCIÓN DE ROL (comentada para desarrollo, descomentar en producción) ──
// if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'Bodeguero') {
//     http_response_code(403);
//     echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado']);
//     exit;
// }

// ── DEPENDENCIAS ──────────────────────────────────────────────────────────────
define('BASE_PATH', dirname(__DIR__));
require_once BASE_PATH . '/models/inventario.php';

// ── ROUTER ────────────────────────────────────────────────────────────────────
$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

try {
    switch ($accion) {

        case 'resumen':
            echo json_encode(Inventario::obtenerResumen());
            break;

        case 'alertas':
            echo json_encode(Inventario::obtenerAlertas());
            break;

        case 'listas':
            echo json_encode(Inventario::obtenerListas());
            break;

        case 'registrarProducto':
            $resultado = Inventario::registrarProducto(
                $_POST['codigo']   ?? '',
                $_POST['nombre']   ?? '',
                $_POST['unidad']   ?? 'Unidad',
                $_POST['grupo']    ?? 'General',
                (float)($_POST['precio']   ?? 0),
                (int)($_POST['stockMin']   ?? 0)
            );
            echo json_encode($resultado);
            break;

        case 'registrarMovimiento':
            $resultado = Inventario::registrarMovimiento(
                $_POST['codigo']        ?? '',
                $_POST['fecha']         ?? '',
                $_POST['tipo']          ?? '',
                (float)($_POST['cantidad'] ?? 0),
                $_POST['observaciones'] ?? ''
            );
            echo json_encode($resultado);
            break;

        case 'stock':
            echo json_encode(Inventario::obtenerStock());
            break;

        case 'buscar':
            $q = trim($_POST['q'] ?? $_GET['q'] ?? '');
            echo json_encode(Inventario::buscarProducto($q));
            break;

        case 'buscarCodigo':
            $q = trim($_POST['q'] ?? $_GET['q'] ?? '');
            echo json_encode(Inventario::buscarPorCodigo($q));
            break;

        case 'historial':
            echo json_encode(Inventario::obtenerHistorial(
                $_POST['fechaDesde'] ?? '',
                $_POST['fechaHasta'] ?? '',
                $_POST['tipo']       ?? ''
            ));
            break;

        case 'exportarStock':
            $stock = Inventario::obtenerStock();
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="stock_' . date('Y-m-d') . '.csv"');
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Código', 'Nombre', 'Unidad', 'Grupo', 'Precio', 'Stock Mín.', 'Stock Actual']);
            foreach ($stock as $p) {
                fputcsv($out, [
                    $p['codigo'], $p['nombre'], $p['unidad'], $p['grupo'],
                    $p['precio'], $p['stockMin'], $p['stockActual']
                ]);
            }
            fclose($out);
            exit;

        case 'validarIntegridad':
            echo json_encode(Inventario::validarIntegridad());
            break;

        default:
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'Acción no reconocida: ' . $accion]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error interno: ' . $e->getMessage()]);
}
?>
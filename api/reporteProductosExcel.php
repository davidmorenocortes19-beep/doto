<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Productos.php';

$datos = Producto::listarTodos();

header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
header('Content-Disposition: attachment; filename="reporte_productos_' . date('Y-m-d') . '.csv"');
header('Pragma: no-cache');
header('Expires: 0');

// ✅ BOM correcto en bytes separados, no concatenado con el primer campo
echo "\xEF\xBB\xBF";

$output = fopen('php://output', 'w');

// ✅ Separador ; en vez de , para que Excel en español separe bien las columnas
fputcsv($output, ['ID', 'Nombre', 'Precio', 'Talla', 'Color', 'Estado'], ';');

foreach ($datos as $item) {
    fputcsv($output, [
        $item['id_producto'],
        $item['nombre'],
        $item['precio'],
        $item['talla'],
        $item['color'],
        $item['estado'],
    ], ';');
}

fclose($output);
exit;
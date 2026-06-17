<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

$datos = Usuario::listarTodos();

header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
header('Content-Disposition: attachment; filename="reporte_usuarios_' . date('Y-m-d') . '.csv"');
header('Pragma: no-cache');
header('Expires: 0');

echo "\xEF\xBB\xBF";

$output = fopen('php://output', 'w');

fputcsv($output, ['ID', 'Nombre', 'Documento', 'Correo', 'Teléfono', 'Dirección', 'Rol'], ';');

foreach ($datos as $item) {
    fputcsv($output, [
        $item['id_usuario'],
        $item['nombre'],
        $item['documento'],
        $item['correo'],
        $item['telefono'],
        $item['direccion'],
        $item['nombre_rol'],
    ], ';');
}

fclose($output);
exit;
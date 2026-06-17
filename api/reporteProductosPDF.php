<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Productos.php';
require_once __DIR__ . '/vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$datos = Producto::listarTodos();

// ── Construir el HTML del reporte ────────────────────────────
$html = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 10px; }
    h1 { color: #B7975B; font-size: 20px; }
    p { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 11px; }
    th { background-color: #B7975B; color: #fff; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Reporte de Productos</h1>
  <p>Generado el: ' . date('d/m/Y H:i') . '</p>
  <table>
    <tr>
      <th>ID</th><th>Nombre</th><th>Precio</th><th>Talla</th>
      <th>Color</th><th>Estado</th>
    </tr>';

foreach ($datos as $item) {
    $html .= '
    <tr>
      <td>' . $item['id_producto'] . '</td>
      <td>' . htmlspecialchars($item['nombre']) . '</td>
      <td>$' . number_format($item['precio'], 0, ',', '.') . '</td>
      <td>' . htmlspecialchars($item['talla']) . '</td>
      <td>' . htmlspecialchars($item['color']) . '</td>
      <td>' . htmlspecialchars($item['estado']) . '</td>
    </tr>';
}

$html .= '
  </table>
</body>
</html>';

// ── Generar el PDF con dompdf ────────────────────────────────
$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true);

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'landscape');
$dompdf->render();

// ── Forzar descarga directa del PDF ──────────────────────────
$nombreArchivo = 'reporte_productos_' . date('Y-m-d') . '.pdf';
$dompdf->stream($nombreArchivo, ['Attachment' => true]);
exit;
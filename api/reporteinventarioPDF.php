<?php
require_once 'config.php';
require_once BASE_PATH . '/models/inventario.php';
require_once __DIR__ . '/vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$datos = Inventario::listarTodos();

// ── Convertir el logo a base64 para embeber en el PDF ────────
$logoPath = __DIR__ . '/../assets/imagenes/logo.png';
$logoBase64 = '';
if (file_exists($logoPath)) {
    $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
}

// ── Construir el HTML del reporte ────────────────────────────
$html = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }

    .report-title {
      font-size: 15px;
      font-weight: bold;
      color: #1E293B;
      margin-bottom: 4px;
    }
    .report-date {
      font-size: 10px;
      color: #888;
      margin-bottom: 14px;
    }

    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 10px; }
    th { background-color: #1E293B; color: #fff; font-size: 10px; }
    tr:nth-child(even) { background-color: #f1f5f9; }

    .footer {
      margin-top: 18px;
      text-align: center;
      font-size: 9px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 8px;
    }
  </style>
</head>
<body>

  <!-- Encabezado con logo y datos de la empresa -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tr>
      <td style="width: 100px; border: none; vertical-align: middle; padding-right: 16px;">
        ' . ($logoBase64 ? '<img src="' . $logoBase64 . '" style="width: 85px; height: 85px; object-fit: contain; background-color: #000; border-radius: 6px;" />' : '') . '
      </td>
      <td style="border: none; vertical-align: middle;">
        <div style="font-size: 20px; font-weight: bold; color: #1E293B; margin-bottom: 4px;">Dotaciones Toronto</div>
        <div style="font-size: 10px; color: #555; margin-bottom: 2px;">dotaciones.elobrero@gmail.com</div>
        <div style="font-size: 10px; color: #555; margin-bottom: 2px;">Carrera 63 Sur #21-12, Bogotá D.C., Colombia</div>
        <div style="font-size: 10px; color: #555;">+57 321 209 9989</div>
      </td>
    </tr>
  </table>
  <hr style="border: none; border-top: 3px solid #1E293B; margin-bottom: 16px;" />

  <!-- Título y fecha -->
  <div class="report-title">Reporte de Inventario</div>
  <div class="report-date">Generado el: ' . date('d/m/Y H:i') . '</div>

  <!-- Tabla de datos -->
  <table>
    <tr>
      <th>ID</th><th>Producto</th><th>Precio</th><th>Talla</th>
      <th>Color</th><th>Estado</th><th>Cant. Actual</th><th>Stock Min.</th>
    </tr>';

foreach ($datos as $item) {
    $html .= '
    <tr>
      <td>' . $item['id_inventario'] . '</td>
      <td>' . htmlspecialchars($item['nombre']) . '</td>
      <td>$' . number_format($item['precio'], 0, ',', '.') . '</td>
      <td>' . htmlspecialchars($item['talla']) . '</td>
      <td>' . htmlspecialchars($item['color']) . '</td>
      <td>' . htmlspecialchars($item['estado']) . '</td>
      <td>' . $item['cantidad_actual'] . '</td>
      <td>' . $item['stock_minimo'] . '</td>
    </tr>';
}

$html .= '
  </table>

  <!-- Pie de página -->
  <div class="footer">
    Dotaciones Toronto &nbsp;|&nbsp; dotaciones.elobrero@gmail.com &nbsp;|&nbsp; +57 321 209 9989
  </div>

</body>
</html>';

// ── Generar el PDF con dompdf ────────────────────────────────
$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true);
$options->set('chroot', realpath(__DIR__ . '/../'));

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'landscape');
$dompdf->render();

// ── Forzar descarga directa del PDF ──────────────────────────
$nombreArchivo = 'reporte_inventario_' . date('Y-m-d') . '.pdf';
$dompdf->stream($nombreArchivo, ['Attachment' => true]);
exit;
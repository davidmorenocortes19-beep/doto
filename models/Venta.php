<?php
require_once BASE_PATH . '/core/DataBase.php';

class Venta
{
    // ── CREAR VENTA DESDE PEDIDO ──────────────────────────────────────
    public static function crearDesdePedido($id_pedido)
    {
        $db = DataBase::conectar();

        // Verificar que no exista ya una venta para este pedido
        $stmt = $db->prepare("SELECT id_venta FROM venta WHERE id_pedido_fk = ?");
        $stmt->execute([$id_pedido]);
        if ($stmt->fetch()) return 'ya_existe';

        // Obtener datos del pedido
        $stmt = $db->prepare("
            SELECT p.id_usuario_fk, dp.id_producto_fk, dp.precio_unitario, dp.cantidad
            FROM pedido p
            INNER JOIN detalle_pedido dp ON dp.id_pedido_fk = p.id_pedido
            WHERE p.id_pedido = ?
        ");
        $stmt->execute([$id_pedido]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($items)) return false;

        $id_usuario  = $items[0]['id_usuario_fk'];
        $total       = array_reduce($items, fn($acc, $i) => $acc + ($i['precio_unitario'] * $i['cantidad']), 0);

        $db->beginTransaction();
        try {
            // Crear venta
            $stmt = $db->prepare("
                INSERT INTO venta (id_usuario_fk, id_pedido_fk, fecha_venta, total_pagado)
                VALUES (?, ?, NOW(), ?)
            ");
            $stmt->execute([$id_usuario, $id_pedido, $total]);
            $id_venta = $db->lastInsertId();

            // Crear detalle_venta
            $stmtDet = $db->prepare("
                INSERT INTO detalle_venta (id_venta_fk, id_producto_fk, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($items as $item) {
                $stmtDet->execute([
                    $id_venta,
                    $item['id_producto_fk'],
                    $item['cantidad'],
                    $item['precio_unitario'],
                ]);
            }

            $db->commit();
            return $id_venta;

        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    // ── LISTAR TODAS LAS VENTAS ───────────────────────────────────────
    public static function listarTodas()
    {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT
                v.id_venta,
                v.fecha_venta,
                v.total_pagado,
                u.nombre  AS cliente_nombre,
                u.correo  AS cliente_correo,
                u.telefono AS cliente_telefono
            FROM venta v
            INNER JOIN usuario u ON u.id_usuario = v.id_usuario_fk
            ORDER BY v.fecha_venta DESC
        ");
        $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtDet = $db->prepare("
            SELECT dv.id_detalle_venta, pr.nombre, dv.cantidad, dv.precio_unitario
            FROM detalle_venta dv
            INNER JOIN producto pr ON pr.id_producto = dv.id_producto_fk
            WHERE dv.id_venta_fk = ?
        ");

        foreach ($ventas as &$venta) {
            $stmtDet->execute([$venta['id_venta']]);
            $venta['productos'] = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
        }

        return $ventas;
    }

    // ── ESTADÍSTICAS ──────────────────────────────────────────────────
    public static function estadisticas()
    {
        $db = DataBase::conectar();

        // Total semana actual
        $stmt = $db->query("
            SELECT COALESCE(SUM(total_pagado), 0) AS total
            FROM venta
            WHERE YEARWEEK(fecha_venta, 1) = YEARWEEK(NOW(), 1)
        ");
        $semana = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Total mes actual
        $stmt = $db->query("
            SELECT COALESCE(SUM(total_pagado), 0) AS total
            FROM venta
            WHERE MONTH(fecha_venta) = MONTH(NOW())
              AND YEAR(fecha_venta)  = YEAR(NOW())
        ");
        $mes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Total general
        $stmt  = $db->query("SELECT COALESCE(SUM(total_pagado), 0) AS total FROM venta");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Ventas por mes (últimos 6 meses)
        $stmt = $db->query("
            SELECT
                DATE_FORMAT(fecha_venta, '%Y-%m') AS mes,
                COUNT(*)                           AS cantidad,
                SUM(total_pagado)                  AS total
            FROM venta
            WHERE fecha_venta >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY mes
            ORDER BY mes ASC
        ");
        $porMes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total_semana' => $semana,
            'total_mes'    => $mes,
            'total_general'=> $total,
            'por_mes'      => $porMes,
        ];
    }
}
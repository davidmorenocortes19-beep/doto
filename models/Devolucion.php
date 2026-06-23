<?php

require_once BASE_PATH . '/core/DataBase.php';

class Devolucion
{
    // ── CREAR DEVOLUCIÓN ──────────────────────────────────────────────
    public static function crear($id_detalle_venta, $cantidad, $motivo)
    {
        $db = DataBase::conectar();

        // Verificar que el detalle_venta existe y tiene suficiente cantidad
        $stmt = $db->prepare("
            SELECT dv.cantidad, p.nombre, p.id_producto
            FROM detalle_venta dv
            INNER JOIN producto p ON p.id_producto = dv.id_producto_fk
            WHERE dv.id_detalle_venta = ?
        ");
        $stmt->execute([$id_detalle_venta]);
        $detalle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$detalle) return 'detalle_no_encontrado';
        if ($cantidad <= 0 || $cantidad > $detalle['cantidad']) return 'cantidad_invalida';

        // Verificar que no exista ya una devolución para ese detalle
        $stmtCheck = $db->prepare("
            SELECT COUNT(*) FROM devolucion WHERE id_detalle_venta_fk = ?
        ");
        $stmtCheck->execute([$id_detalle_venta]);
        if ($stmtCheck->fetchColumn() > 0) return 'ya_existe_devolucion';

        $stmtIns = $db->prepare("
            INSERT INTO devolucion (id_detalle_venta_fk, cantidad, motivo, fecha_devolucion)
            VALUES (?, ?, ?, CURDATE())
        ");
        $ok = $stmtIns->execute([$id_detalle_venta, $cantidad, $motivo]);

        return $ok ? $db->lastInsertId() : false;
    }

    // ── LISTAR TODAS LAS DEVOLUCIONES (admin) ─────────────────────────
    public static function listarTodas()
    {
        $db = DataBase::conectar();

        $stmt = $db->query("
            SELECT
                d.id_devolucion,
                d.cantidad,
                d.motivo,
                d.fecha_devolucion,
                p.nombre        AS producto_nombre,
                p.precio        AS producto_precio,
                u.nombre        AS cliente_nombre,
                u.correo        AS cliente_correo,
                u.telefono      AS cliente_telefono,
                v.id_venta,
                v.fecha_venta,
                dv.id_detalle_venta
            FROM devolucion d
            INNER JOIN detalle_venta dv ON dv.id_detalle_venta = d.id_detalle_venta_fk
            INNER JOIN producto p       ON p.id_producto       = dv.id_producto_fk
            INNER JOIN venta v          ON v.id_venta          = dv.id_venta_fk
            INNER JOIN usuario u        ON u.id_usuario        = v.id_usuario_fk
            ORDER BY d.fecha_devolucion DESC, d.id_devolucion DESC
        ");

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['subtotal_devuelto'] = floatval($row['producto_precio']) * intval($row['cantidad']);
        }
        unset($row);

        return $rows;
    }

    // ── LISTAR DEVOLUCIONES DE UN USUARIO ─────────────────────────────
    public static function listarPorUsuario($id_usuario)
    {
        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT
                d.id_devolucion,
                d.cantidad,
                d.motivo,
                d.fecha_devolucion,
                p.nombre   AS producto_nombre,
                p.precio   AS producto_precio,
                v.id_venta,
                v.fecha_venta,
                dv.id_detalle_venta
            FROM devolucion d
            INNER JOIN detalle_venta dv ON dv.id_detalle_venta = d.id_detalle_venta_fk
            INNER JOIN producto p       ON p.id_producto       = dv.id_producto_fk
            INNER JOIN venta v          ON v.id_venta          = dv.id_venta_fk
            WHERE v.id_usuario_fk = ?
            ORDER BY d.fecha_devolucion DESC, d.id_devolucion DESC
        ");
        $stmt->execute([$id_usuario]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['subtotal_devuelto'] = floatval($row['producto_precio']) * intval($row['cantidad']);
        }
        unset($row);

        return $rows;
    }

    // ── OBTENER VENTAS DE UN USUARIO (para solicitar devolución) ──────
    public static function ventasPorUsuario($id_usuario)
    {
        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT
                dv.id_detalle_venta,
                dv.cantidad,
                p.nombre  AS producto_nombre,
                p.precio  AS producto_precio,
                v.id_venta,
                v.fecha_venta,
                CASE WHEN dev.id_devolucion IS NOT NULL THEN 1 ELSE 0 END AS ya_devuelto
            FROM detalle_venta dv
            INNER JOIN producto p ON p.id_producto = dv.id_producto_fk
            INNER JOIN venta v    ON v.id_venta    = dv.id_venta_fk
            LEFT  JOIN devolucion dev ON dev.id_detalle_venta_fk = dv.id_detalle_venta
            WHERE v.id_usuario_fk = ?
            ORDER BY v.fecha_venta DESC
        ");
        $stmt->execute([$id_usuario]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['ya_devuelto']       = (bool) $row['ya_devuelto'];
            $row['subtotal']          = floatval($row['producto_precio']) * intval($row['cantidad']);
        }
        unset($row);

        return $rows;
    }

    // ── ELIMINAR DEVOLUCIÓN (admin) ───────────────────────────────────
    public static function eliminar($id_devolucion)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("DELETE FROM devolucion WHERE id_devolucion = ?");
        return $stmt->execute([$id_devolucion]);
    }
}
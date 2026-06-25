<?php
require_once BASE_PATH . '/core/DataBase.php';

class Devolucion
{
    // ── CREAR DEVOLUCIÓN ──────────────────────────────────────────────
    public static function crear($id_detalle_venta, $cantidad, $motivo)
    {
        $db = DataBase::conectar();

        // Verificar que el detalle_venta exista y obtener cantidad original
        $stmt = $db->prepare("
            SELECT dv.cantidad, dv.id_venta_fk
            FROM detalle_venta dv
            WHERE dv.id_detalle_venta = ?
        ");
        $stmt->execute([$id_detalle_venta]);
        $detalle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$detalle) return 'no_existe';
        if ($cantidad <= 0 || $cantidad > $detalle['cantidad']) return 'cantidad_invalida';

        $stmt = $db->prepare("
            INSERT INTO devolucion (id_detalle_venta_fk, cantidad, motivo, fecha_devolucion, estado)
            VALUES (?, ?, ?, CURDATE(), 'Pendiente')
        ");
        return $stmt->execute([$id_detalle_venta, $cantidad, $motivo]);
    }

    // ── LISTAR DEVOLUCIONES DE UN USUARIO (cliente) ───────────────────
    public static function listarPorUsuario($id_usuario)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("
            SELECT
                d.id_devolucion,
                d.cantidad,
                d.motivo,
                d.fecha_devolucion,
                d.estado,
                pr.nombre   AS producto_nombre,
                dv.precio_unitario,
                v.id_venta
            FROM devolucion d
            INNER JOIN detalle_venta dv ON dv.id_detalle_venta = d.id_detalle_venta_fk
            INNER JOIN producto pr      ON pr.id_producto      = dv.id_producto_fk
            INNER JOIN venta v          ON v.id_venta          = dv.id_venta_fk
            WHERE v.id_usuario_fk = ?
            ORDER BY d.fecha_devolucion DESC
        ");
        $stmt->execute([$id_usuario]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── LISTAR TODAS LAS DEVOLUCIONES (admin/vendedor) ────────────────
    public static function listarTodas()
    {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT
                d.id_devolucion,
                d.cantidad,
                d.motivo,
                d.fecha_devolucion,
                d.estado,
                pr.nombre       AS producto_nombre,
                dv.precio_unitario,
                u.nombre        AS cliente_nombre,
                u.correo        AS cliente_correo,
                u.telefono      AS cliente_telefono,
                v.id_venta
            FROM devolucion d
            INNER JOIN detalle_venta dv ON dv.id_detalle_venta = d.id_detalle_venta_fk
            INNER JOIN producto pr      ON pr.id_producto      = dv.id_producto_fk
            INNER JOIN venta v          ON v.id_venta          = dv.id_venta_fk
            INNER JOIN usuario u        ON u.id_usuario        = v.id_usuario_fk
            ORDER BY d.fecha_devolucion DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── CAMBIAR ESTADO DE DEVOLUCIÓN ──────────────────────────────────
    public static function cambiarEstado($id_devolucion, $estado)
    {
        $estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada'];
        if (!in_array($estado, $estadosValidos)) return 'estado_invalido';

        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE devolucion SET estado = ? WHERE id_devolucion = ?");
        return $stmt->execute([$estado, $id_devolucion]);
    }

    // ── OBTENER PRODUCTOS DE UNA VENTA (para el formulario) ───────────
    public static function productosDeVenta($id_venta)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("
            SELECT
                dv.id_detalle_venta,
                pr.nombre,
                dv.cantidad,
                dv.precio_unitario
            FROM detalle_venta dv
            INNER JOIN producto pr ON pr.id_producto = dv.id_producto_fk
            WHERE dv.id_venta_fk = ?
        ");
        $stmt->execute([$id_venta]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
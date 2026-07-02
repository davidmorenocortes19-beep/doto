<?php

require_once BASE_PATH . '/core/DataBase.php';

class Inventario
{
    // ── LISTAR TODOS (activos) ────────────────────────────────────────
    public static function listarTodos()
    {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT i.id_inventario, i.id_producto_fk, p.nombre, p.precio,
                   p.talla, p.color, p.estado, i.cantidad_actual, i.stock_minimo, i.inhabilitado
            FROM inventario i
            INNER JOIN producto p ON p.id_producto = i.id_producto_fk
            WHERE i.inhabilitado = 0
            ORDER BY p.nombre ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── LISTAR INHABILITADOS ──────────────────────────────────────────
    public static function listarInhabilitados()
    {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT i.id_inventario, i.id_producto_fk, p.nombre, p.precio,
                   p.talla, p.color, p.estado, i.cantidad_actual, i.stock_minimo, i.inhabilitado
            FROM inventario i
            INNER JOIN producto p ON p.id_producto = i.id_producto_fk
            WHERE i.inhabilitado = 1
            ORDER BY p.nombre ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── OBTENER POR ID ────────────────────────────────────────────────
    public static function obtenerPorId($id)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("
            SELECT i.id_inventario, i.id_producto_fk, p.nombre, p.precio,
                   p.talla, p.color, p.estado, i.cantidad_actual, i.stock_minimo, i.inhabilitado
            FROM inventario i
            INNER JOIN producto p ON p.id_producto = i.id_producto_fk
            WHERE i.id_inventario = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ── CREAR ─────────────────────────────────────────────────────────
    public static function crear($id_producto_fk, $cantidad_actual, $stock_minimo)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("SELECT id_inventario FROM inventario WHERE id_producto_fk = ?");
        $stmt->execute([$id_producto_fk]);
        if ($stmt->fetch()) return 'exist';

        $stmt = $db->prepare("
            INSERT INTO inventario (id_producto_fk, cantidad_actual, stock_minimo)
            VALUES (?, ?, ?)
        ");
        return $stmt->execute([$id_producto_fk, $cantidad_actual, $stock_minimo]);
    }

    // ── ACTUALIZAR ────────────────────────────────────────────────────
    public static function actualizar($id_inventario, $id_producto_fk, $cantidad_actual, $stock_minimo)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("
            SELECT id_inventario FROM inventario
            WHERE id_producto_fk = ? AND id_inventario <> ?
        ");
        $stmt->execute([$id_producto_fk, $id_inventario]);
        if ($stmt->fetch()) return 'exist';

        $stmt = $db->prepare("
            UPDATE inventario
            SET id_producto_fk = ?, cantidad_actual = ?, stock_minimo = ?
            WHERE id_inventario = ?
        ");
        return $stmt->execute([$id_producto_fk, $cantidad_actual, $stock_minimo, $id_inventario]);
    }

    // ── ELIMINAR ──────────────────────────────────────────────────────
    public static function eliminar($id)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("DELETE FROM inventario WHERE id_inventario = ?");
        return $stmt->execute([$id]);
    }

    // ── PRODUCTO EXISTE ───────────────────────────────────────────────
    public static function productoExiste($id_producto)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("SELECT id_producto FROM producto WHERE id_producto = ?");
        $stmt->execute([$id_producto]);
        return (bool) $stmt->fetch();
    }

    // ── TOGGLE INHABILITADO ───────────────────────────────────────────
    public static function toggleInhabilitado($id_inventario, $inhabilitado)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE inventario SET inhabilitado = ? WHERE id_inventario = ?");
        return $stmt->execute([$inhabilitado ? 1 : 0, $id_inventario]);
    }
}
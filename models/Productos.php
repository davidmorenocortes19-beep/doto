<?php

require_once BASE_PATH . '/core/DataBase.php';

class Producto {

    // ── LISTAR TODOS ─────────────────────────────────────────────────
    public static function listarTodos() {

        $db = DataBase::conectar();

        $stmt = $db->query("
            SELECT id_producto, nombre, precio, talla, color, imagen, estado
            FROM producto
            ORDER BY nombre ASC
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── OBTENER UNO POR ID ───────────────────────────────────────────
    public static function obtenerPorId($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_producto, nombre, precio, talla, color, imagen, estado
            FROM producto
            WHERE id_producto = ?
        ");

        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ── CREAR PRODUCTO ───────────────────────────────────────────────
    public static function crear($nombre, $precio, $talla, $color, $imagen = '', $estado = 'Disponible') {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_producto FROM producto WHERE nombre = ?");
        $stmt->execute([$nombre]);
        if ($stmt->fetch()) return "exist";

        $stmt = $db->prepare("
            INSERT INTO producto (nombre, precio, talla, color, imagen, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        return $stmt->execute([$nombre, $precio, $talla, $color, $imagen, $estado]);
    }

    // ── ACTUALIZAR PRODUCTO ──────────────────────────────────────────
    public static function actualizar($id, $nombre, $precio, $talla, $color, $imagen, $estado) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_producto FROM producto
            WHERE nombre = ? AND id_producto <> ?
        ");
        $stmt->execute([$nombre, $id]);
        if ($stmt->fetch()) return "exist";

        $stmt = $db->prepare("
            UPDATE producto
            SET nombre  = ?,
                precio  = ?,
                talla   = ?,
                color   = ?,
                imagen  = ?,
                estado  = ?
            WHERE id_producto = ?
        ");

        return $stmt->execute([$nombre, $precio, $talla, $color, $imagen, $estado, $id]);
    }

    // ── ELIMINAR PRODUCTO ────────────────────────────────────────────
    public static function eliminar($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("DELETE FROM producto WHERE id_producto = ?");
        return $stmt->execute([$id]);
    }

    // ── LISTAR POR ESTADO ────────────────────────────────────────────
    public static function listarPorEstado($estado) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_producto, nombre, precio, talla, color, imagen, estado
            FROM producto
            WHERE estado = ?
            ORDER BY nombre ASC
        ");

        $stmt->execute([$estado]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

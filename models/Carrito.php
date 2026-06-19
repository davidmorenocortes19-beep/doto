<?php

require_once BASE_PATH . '/core/DataBase.php';

class Carrito
{

    // ── OBTENER O CREAR EL CARRITO DE UN USUARIO ─────────────────────
    // Cada usuario tiene un solo carrito "activo". Si no existe, se crea.
    public static function obtenerOCrearId($id_usuario)
    {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_carrito FROM carrito WHERE id_usuario_fk = ?");
        $stmt->execute([$id_usuario]);
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($fila) {
            return $fila['id_carrito'];
        }

        $stmt = $db->prepare("
            INSERT INTO carrito (id_usuario_fk, fecha_creacion)
            VALUES (?, CURDATE())
        ");
        $stmt->execute([$id_usuario]);

        return $db->lastInsertId();
    }

    // ── LISTAR ITEMS DEL CARRITO DE UN USUARIO ───────────────────────
    public static function listarPorUsuario($id_usuario)
    {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT
                dc.id_detalle_carrito,
                dc.cantidad,
                p.id_producto,
                p.nombre,
                p.precio,
                p.talla,
                p.color,
                p.imagen,
                p.estado
            FROM carrito c
            INNER JOIN detalle_carrito dc ON dc.id_carrito_fk = c.id_carrito
            INNER JOIN producto p ON p.id_producto = dc.id_producto_fk
            WHERE c.id_usuario_fk = ?
            ORDER BY dc.id_detalle_carrito ASC
        ");
        $stmt->execute([$id_usuario]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── AGREGAR PRODUCTO AL CARRITO (o sumar cantidad si ya existe) ──
    public static function agregar($id_usuario, $id_producto, $cantidad = 1)
    {

        $db = DataBase::conectar();
        $id_carrito = self::obtenerOCrearId($id_usuario);

        $stmt = $db->prepare("
            SELECT id_detalle_carrito, cantidad
            FROM detalle_carrito
            WHERE id_carrito_fk = ? AND id_producto_fk = ?
        ");
        $stmt->execute([$id_carrito, $id_producto]);
        $existente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existente) {
            $nuevaCantidad = $existente['cantidad'] + $cantidad;
            $stmt = $db->prepare("
                UPDATE detalle_carrito SET cantidad = ?
                WHERE id_detalle_carrito = ?
            ");
            return $stmt->execute([$nuevaCantidad, $existente['id_detalle_carrito']]);
        }

        $stmt = $db->prepare("
            INSERT INTO detalle_carrito (id_carrito_fk, id_producto_fk, cantidad)
            VALUES (?, ?, ?)
        ");
        return $stmt->execute([$id_carrito, $id_producto, $cantidad]);
    }

    // ── ACTUALIZAR CANTIDAD DE UN ITEM ────────────────────────────────
    public static function actualizarCantidad($id_detalle_carrito, $cantidad)
    {

        $db = DataBase::conectar();

        if ($cantidad <= 0) {
            return self::eliminarItem($id_detalle_carrito);
        }

        $stmt = $db->prepare("
            UPDATE detalle_carrito SET cantidad = ?
            WHERE id_detalle_carrito = ?
        ");
        return $stmt->execute([$cantidad, $id_detalle_carrito]);
    }

    // ── ELIMINAR UN ITEM DEL CARRITO ──────────────────────────────────
    public static function eliminarItem($id_detalle_carrito)
    {

        $db = DataBase::conectar();

        $stmt = $db->prepare("DELETE FROM detalle_carrito WHERE id_detalle_carrito = ?");
        return $stmt->execute([$id_detalle_carrito]);
    }

    // ── VACIAR TODO EL CARRITO DE UN USUARIO ──────────────────────────
    public static function vaciar($id_usuario)
    {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_carrito FROM carrito WHERE id_usuario_fk = ?");
        $stmt->execute([$id_usuario]);
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$fila) return true;

        $stmt = $db->prepare("DELETE FROM detalle_carrito WHERE id_carrito_fk = ?");
        return $stmt->execute([$fila['id_carrito']]);
    }
}

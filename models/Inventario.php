<?php

require_once BASE_PATH . '/core/DataBase.php';

class Inventario {

    public static function listarTodos() {

        $db = DataBase::conectar();

        $stmt = $db->query("
            SELECT i.id_inventario, i.id_producto_fk, i.cantidad_actual, i.stock_minimo,
                   p.nombre, p.precio, p.talla, p.color, p.estado
            FROM inventario i
            INNER JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE i.inhabilitado = 0
            ORDER BY p.nombre ASC
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerPorId($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT i.id_inventario, i.id_producto_fk, i.cantidad_actual, i.stock_minimo,
                   p.nombre, p.precio, p.talla, p.color, p.estado
            FROM inventario i
            INNER JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE i.id_inventario = ?
        ");

        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function productoExiste($id_producto) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_producto FROM producto WHERE id_producto = ?");
        $stmt->execute([$id_producto]);

        return (bool) $stmt->fetch();
    }

    public static function crear($id_producto, $cantidad_actual, $stock_minimo) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_inventario FROM inventario WHERE id_producto_fk = ?");
        $stmt->execute([$id_producto]);
        if ($stmt->fetch()) return "exist";

        $stmt = $db->prepare("
            INSERT INTO inventario (id_producto_fk, cantidad_actual, stock_minimo)
            VALUES (?, ?, ?)
        ");

        $resultado = $stmt->execute([$id_producto, $cantidad_actual, $stock_minimo]);

        if ($resultado) {
            self::sincronizarEstadoProducto($id_producto, $cantidad_actual);
            self::registrarAlertaStock($id_producto, $cantidad_actual, $stock_minimo);
        }

        return $resultado;
    }

    public static function actualizar($id, $id_producto, $cantidad_actual, $stock_minimo) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_inventario FROM inventario
            WHERE id_producto_fk = ? AND id_inventario <> ?
        ");
        $stmt->execute([$id_producto, $id]);
        if ($stmt->fetch()) return "exist";

        $stmt = $db->prepare("
            UPDATE inventario
            SET id_producto_fk = ?,
                cantidad_actual = ?,
                stock_minimo = ?
            WHERE id_inventario = ?
        ");

        $resultado = $stmt->execute([$id_producto, $cantidad_actual, $stock_minimo, $id]);

        if ($resultado) {
            self::sincronizarEstadoProducto($id_producto, $cantidad_actual);
            self::registrarAlertaStock($id_producto, $cantidad_actual, $stock_minimo);
        }

        return $resultado;
    }

    public static function eliminar($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("DELETE FROM inventario WHERE id_inventario = ?");
        return $stmt->execute([$id]);
    }

    private static function sincronizarEstadoProducto($id_producto, $cantidad_actual) {

        $db = DataBase::conectar();
        $estado = $cantidad_actual > 0 ? 'Disponible' : 'Agotado';

        $stmt = $db->prepare("UPDATE producto SET estado = ? WHERE id_producto = ?");
        return $stmt->execute([$estado, $id_producto]);
    }

    private static function registrarAlertaStock($id_producto, $cantidad_actual, $stock_minimo) {

        if ($cantidad_actual > $stock_minimo) return true;

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            INSERT INTO alerta_stock (id_producto_fk, nivel_stock, fecha_alerta)
            VALUES (?, ?, CURDATE())
        ");

        return $stmt->execute([$id_producto, $cantidad_actual]);
    }

    // ── LISTAR INHABILITADOS ─────────────────────────────────────────
    public static function listarInhabilitados() {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT i.id_inventario, i.id_producto_fk, p.nombre, p.precio,
                p.talla, p.color, p.estado, i.cantidad_actual, i.stock_minimo
            FROM inventario i
            INNER JOIN producto p ON p.id_producto = i.id_producto_fk
            WHERE i.inhabilitado = 1
            ORDER BY p.nombre ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── TOGGLE INHABILITADO ───────────────────────────────────────────
    public static function toggleInhabilitado($id_inventario, $inhabilitado) {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE inventario SET inhabilitado = ? WHERE id_inventario = ?");
        return $stmt->execute([$inhabilitado ? 1 : 0, $id_inventario]);
    }
}
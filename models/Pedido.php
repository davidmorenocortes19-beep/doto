<?php

require_once BASE_PATH . '/core/DataBase.php';
require_once BASE_PATH . '/models/Carrito.php';

class Pedido
{

    // ── CREAR PEDIDO A PARTIR DEL CARRITO ─────────────────────────────
    // Toma todo lo que hay en el carrito del usuario, lo pasa a
    // pedido + detalle_pedido, y luego vacía el carrito.
    public static function crearDesdeCarrito($id_usuario)
    {

        $db = DataBase::conectar();
        $items = Carrito::listarPorUsuario($id_usuario);

        if (empty($items)) {
            return 'carrito_vacio';
        }

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("
                INSERT INTO pedido (id_usuario_fk, fecha_pedido, estado)
                VALUES (?, NOW(), 'Pendiente')
            ");
            $stmt->execute([$id_usuario]);
            $id_pedido = $db->lastInsertId();

            $stmtDetalle = $db->prepare("
                INSERT INTO detalle_pedido (id_pedido_fk, id_producto_fk, precio_unitario, cantidad)
                VALUES (?, ?, ?, ?)
            ");

            foreach ($items as $item) {
                $stmtDetalle->execute([
                    $id_pedido,
                    $item['id_producto'],
                    $item['precio'],
                    $item['cantidad'],
                ]);
            }

            Carrito::vaciar($id_usuario);

            $db->commit();
            return $id_pedido;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    // ── LISTAR PEDIDOS DE UN USUARIO (con sus productos) ──────────────
    public static function listarPorUsuario($id_usuario)
    {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_pedido, fecha_pedido, estado
            FROM pedido
            WHERE id_usuario_fk = ?
            ORDER BY fecha_pedido DESC
        ");
        $stmt->execute([$id_usuario]);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtDetalle = $db->prepare("
            SELECT dp.id_producto_fk, p.nombre, dp.precio_unitario, dp.cantidad
            FROM detalle_pedido dp
            INNER JOIN producto p ON p.id_producto = dp.id_producto_fk
            WHERE dp.id_pedido_fk = ?
        ");

        foreach ($pedidos as &$pedido) {
            $stmtDetalle->execute([$pedido['id_pedido']]);
            $pedido['productos'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
            $pedido['total'] = array_reduce($pedido['productos'], function ($acc, $p) {
                return $acc + ($p['precio_unitario'] * $p['cantidad']);
            }, 0);
        }

        return $pedidos;
    }
}

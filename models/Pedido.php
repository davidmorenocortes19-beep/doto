<?php

require_once BASE_PATH . '/core/DataBase.php';
require_once BASE_PATH . '/models/Carrito.php';

class Pedido
{
    // ── CREAR PEDIDO A PARTIR DEL CARRITO ─────────────────────────────
    public static function crearDesdeCarrito($id_usuario)
    {
        $db    = DataBase::conectar();
        $items = Carrito::listarPorUsuario($id_usuario);

        if (empty($items)) return 'carrito_vacio';

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

    // ── LISTAR PEDIDOS DE UN USUARIO (con número de pedido por cliente)
    public static function listarPorUsuario($id_usuario)
    {
        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                ROW_NUMBER() OVER (
                    PARTITION BY p.id_usuario_fk
                    ORDER BY p.fecha_pedido ASC, p.id_pedido ASC
                ) AS numero_pedido
            FROM pedido p
            WHERE p.id_usuario_fk = ?
              AND p.oculto = 0
            ORDER BY p.fecha_pedido DESC
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
            $pedido['total']     = array_reduce(
                $pedido['productos'],
                fn($acc, $p) => $acc + ($p['precio_unitario'] * $p['cantidad']),
                0
            );
        }

        return $pedidos;
    }

    // ── LISTAR TODOS LOS PEDIDOS (admin) ──────────────────────────────
    public static function listarTodos(bool $soloOcultos = false)
    {
        $db = DataBase::conectar();

        $condicion = $soloOcultos ? 'p.oculto = 1' : 'p.oculto = 0';

        $stmt = $db->query("
           SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.oculto,
                u.nombre     AS cliente_nombre,
                u.correo     AS cliente_correo,
                u.telefono   AS cliente_telefono,
                u.direccion  AS cliente_direccion,
                ROW_NUMBER() OVER (
                    PARTITION BY p.id_usuario_fk
                    ORDER BY p.fecha_pedido ASC, p.id_pedido ASC
                ) AS numero_pedido
            FROM pedido p
            INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
            WHERE {$condicion}
            ORDER BY p.fecha_pedido DESC
        ");
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtDetalle = $db->prepare("
            SELECT dp.id_producto_fk, pr.nombre, dp.precio_unitario, dp.cantidad
            FROM detalle_pedido dp
            INNER JOIN producto pr ON pr.id_producto = dp.id_producto_fk
            WHERE dp.id_pedido_fk = ?
        ");

        foreach ($pedidos as &$pedido) {
            $stmtDetalle->execute([$pedido['id_pedido']]);
            $pedido['productos'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
            $pedido['total']     = array_reduce(
                $pedido['productos'],
                fn($acc, $p) => $acc + ($p['precio_unitario'] * $p['cantidad']),
                0
            );
        }

        return $pedidos;
    }

    // ── CAMBIAR ESTADO DE UN PEDIDO ───────────────────────────────────
    public static function cambiarEstado($id_pedido, $estado)
    {
        $estadosValidos = ['Pendiente', 'Enviado', 'Entregado'];
        if (!in_array($estado, $estadosValidos)) return 'estado_invalido';

        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE pedido SET estado = ? WHERE id_pedido = ?");
        return $stmt->execute([$estado, $id_pedido]);
    }

    // ── OCULTAR / MOSTRAR UN PEDIDO ───────────────────────────────────
    public static function toggleOculto($id_pedido, $oculto)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE pedido SET oculto = ? WHERE id_pedido = ?");
        return $stmt->execute([$oculto ? 1 : 0, $id_pedido]);
    }
}
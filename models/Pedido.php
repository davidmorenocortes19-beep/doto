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
                INSERT INTO pedido (id_usuario_fk, fecha_pedido, estado, oculto)
                VALUES (?, NOW(), 'Pendiente', 0)
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

    // ── LISTAR PEDIDOS DE UN USUARIO ──────────────────────────────────
    public static function listarPorUsuario($id_usuario)
    {
        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado
            FROM pedido p
            WHERE p.id_usuario_fk = ?
              AND p.oculto = 0
            ORDER BY p.fecha_pedido ASC, p.id_pedido ASC
        ");
        $stmt->execute([$id_usuario]);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Numerar manualmente
        foreach ($pedidos as $i => &$pedido) {
            $pedido['numero_pedido'] = $i + 1;
        }
        unset($pedido);

        // Reordenar de más reciente a más antiguo
        $pedidos = array_reverse($pedidos);

        // Obtener id_venta asociada a cada pedido (para el botón de devolución)
        $stmtVenta = $db->prepare("
            SELECT id_venta FROM venta WHERE id_pedido_fk = ? LIMIT 1
        ");

        $stmtDetalle = $db->prepare("
            SELECT dp.id_producto_fk, pr.nombre, dp.precio_unitario, dp.cantidad
            FROM detalle_pedido dp
            INNER JOIN producto pr ON pr.id_producto = dp.id_producto_fk
            WHERE dp.id_pedido_fk = ?
        ");

        foreach ($pedidos as &$pedido) {
            // Productos
            $stmtDetalle->execute([$pedido['id_pedido']]);
            $pedido['productos'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
            $total = 0;
            foreach ($pedido['productos'] as $p) {
                $total += floatval($p['precio_unitario']) * intval($p['cantidad']);
            }
            $pedido['total'] = $total;

            // Venta asociada
            $stmtVenta->execute([$pedido['id_pedido']]);
            $venta = $stmtVenta->fetch(PDO::FETCH_ASSOC);
            $pedido['id_venta'] = $venta ? (int) $venta['id_venta'] : null;
        }
        unset($pedido);

        return $pedidos;
    }

    // ── LISTAR TODOS LOS PEDIDOS (admin/vendedor) ─────────────────────
    public static function listarTodos($soloOcultos = false)
    {
        $db = DataBase::conectar();

        $condicion = $soloOcultos ? 'p.oculto = 1' : 'p.oculto = 0';

        $stmt = $db->prepare("
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.oculto,
                p.id_usuario_fk,
                u.nombre    AS cliente_nombre,
                u.correo    AS cliente_correo,
                u.telefono  AS cliente_telefono,
                u.direccion AS cliente_direccion
            FROM pedido p
            INNER JOIN usuario u ON u.id_usuario = p.id_usuario_fk
            WHERE {$condicion}
            ORDER BY p.id_usuario_fk ASC, p.fecha_pedido ASC, p.id_pedido ASC
        ");
        $stmt->execute();
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Numerar por usuario manualmente
        $contadorPorUsuario = [];
        foreach ($pedidos as &$pedido) {
            $uid = $pedido['id_usuario_fk'];
            if (!isset($contadorPorUsuario[$uid])) {
                $contadorPorUsuario[$uid] = 0;
            }
            $contadorPorUsuario[$uid]++;
            $pedido['numero_pedido'] = $contadorPorUsuario[$uid];
        }
        unset($pedido);

        // Reordenar de más reciente a más antiguo
        usort($pedidos, function ($a, $b) {
            return strcmp($b['fecha_pedido'], $a['fecha_pedido']);
        });

        $stmtDetalle = $db->prepare("
            SELECT dp.id_producto_fk, pr.nombre, dp.precio_unitario, dp.cantidad
            FROM detalle_pedido dp
            INNER JOIN producto pr ON pr.id_producto = dp.id_producto_fk
            WHERE dp.id_pedido_fk = ?
        ");

        foreach ($pedidos as &$pedido) {
            $stmtDetalle->execute([$pedido['id_pedido']]);
            $pedido['productos'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
            $total = 0;
            foreach ($pedido['productos'] as $p) {
                $total += floatval($p['precio_unitario']) * intval($p['cantidad']);
            }
            $pedido['total'] = $total;
        }
        unset($pedido);

        return $pedidos;
    }

    // ── CAMBIAR ESTADO DE UN PEDIDO ───────────────────────────────────
    public static function cambiarEstado($id_pedido, $estado)
    {
        $estadosValidos = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
        if (!in_array($estado, $estadosValidos)) return 'estado_invalido';

        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE pedido SET estado = ? WHERE id_pedido = ?");
        return $stmt->execute([$estado, $id_pedido]);
    }

    // ── CANCELAR PEDIDO (solo si está Pendiente) ──────────────────────
    public static function cancelar($id_pedido)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("SELECT estado FROM pedido WHERE id_pedido = ?");
        $stmt->execute([$id_pedido]);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pedido || $pedido['estado'] !== 'Pendiente') return 'no_pendiente';

        $stmt = $db->prepare("UPDATE pedido SET estado = 'Cancelado' WHERE id_pedido = ?");
        return $stmt->execute([$id_pedido]);
    }

    // ── OCULTAR / MOSTRAR UN PEDIDO ───────────────────────────────────
    public static function toggleOculto($id_pedido, $oculto)
    {
        $db   = DataBase::conectar();
        $stmt = $db->prepare("UPDATE pedido SET oculto = ? WHERE id_pedido = ?");
        return $stmt->execute([$oculto ? 1 : 0, $id_pedido]);
    }
}

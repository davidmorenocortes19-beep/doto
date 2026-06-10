<?php
/**
 * Inventario.php — Modelo
 * Ubicación: models/Inventario.php
 */

require_once BASE_PATH . '/core/Database.php';

class Inventario {

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────

    public static function obtenerResumen(): array {
        $db = DataBase::conectar();

        $totalProductos   = $db->query("SELECT COUNT(*) FROM inventario")->fetchColumn();
        $totalMovimientos = $db->query("SELECT COUNT(*) FROM movimiento_inventario")->fetchColumn();
        $sinStock         = $db->query("SELECT COUNT(*) FROM inventario WHERE stock_actual <= 0")->fetchColumn();
        $stockBajo        = $db->query("
            SELECT COUNT(*) FROM inventario
            WHERE stock_actual > 0 AND stock_actual <= stock_minimo
        ")->fetchColumn();

        return [
            'totalProductos'   => (int)$totalProductos,
            'totalMovimientos' => (int)$totalMovimientos,
            'sinStock'         => (int)$sinStock,
            'stockBajo'        => (int)$stockBajo,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ALERTAS
    // ─────────────────────────────────────────────────────────────────────────

    public static function obtenerAlertas(): array {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT p.codigo, p.nombre,
                   i.stock_minimo  AS stockMin,
                   i.stock_actual  AS stockActual
            FROM inventario i
            JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE i.stock_actual <= i.stock_minimo
            ORDER BY i.stock_actual ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LISTAS
    // ─────────────────────────────────────────────────────────────────────────

    public static function obtenerListas(): array {
        return [
            'unidades' => ['Unidad', 'Par', 'Caja', 'Metro', 'Kg'],
            'grupos'   => ['Dotación', 'Calzado', 'Protección', 'Herramientas', 'Accesorios'],
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRAR PRODUCTO
    // ─────────────────────────────────────────────────────────────────────────

    public static function registrarProducto(
        string $codigo, string $nombre, string $unidad,
        string $grupo,  float  $precio, int    $stockMin
    ): array {

        $db = DataBase::conectar();

        $check = $db->prepare("SELECT id_producto FROM producto WHERE codigo = ?");
        $check->execute([$codigo]);
        if ($check->fetch()) {
            return ['ok' => false, 'mensaje' => "El código '$codigo' ya existe."];
        }

        try {
            $db->beginTransaction();

            $ins = $db->prepare("
                INSERT INTO producto (codigo, nombre, precio, unidad, grupo, estado)
                VALUES (?, ?, ?, ?, ?, 'Disponible')
            ");
            $ins->execute([$codigo, $nombre, $precio, $unidad, $grupo]);
            $idProducto = $db->lastInsertId();

            $inv = $db->prepare("
                INSERT INTO inventario (id_producto_fk, stock_minimo, stock_actual)
                VALUES (?, ?, 0)
            ");
            $inv->execute([$idProducto, $stockMin]);

            $db->commit();
            return ['ok' => true, 'mensaje' => 'Producto registrado correctamente.'];

        } catch (Exception $e) {
            $db->rollBack();
            return ['ok' => false, 'mensaje' => 'Error al registrar: ' . $e->getMessage()];
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRAR MOVIMIENTO
    // ─────────────────────────────────────────────────────────────────────────

    public static function registrarMovimiento(
        string $codigo, string $fecha, string $tipo,
        float  $cantidad, string $observaciones
    ): array {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT i.id_inventario, i.stock_actual
            FROM inventario i
            JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE p.codigo = ?
        ");
        $stmt->execute([$codigo]);
        $inv = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$inv) {
            return ['ok' => false, 'mensaje' => "Producto con código '$codigo' no encontrado."];
        }

        $stockActual = (float) $inv['stock_actual'];

        switch ($tipo) {
            case 'INGRESO':
            case 'AJUSTE_POSITIVO':
                $nuevoStock = $stockActual + $cantidad;
                break;
            case 'SALIDA':
            case 'AJUSTE_NEGATIVO':
                if ($stockActual < $cantidad) {
                    return ['ok' => false, 'mensaje' => 'Stock insuficiente para realizar la salida.'];
                }
                $nuevoStock = $stockActual - $cantidad;
                break;
            default:
                return ['ok' => false, 'mensaje' => "Tipo '$tipo' no válido."];
        }

        try {
            $db->beginTransaction();

            $db->prepare("
                INSERT INTO movimiento_inventario
                    (id_inventario_fk, tipo, cantidad, fecha, observaciones)
                VALUES (?, ?, ?, ?, ?)
            ")->execute([$inv['id_inventario'], $tipo, $cantidad, $fecha, $observaciones]);

            $db->prepare("
                UPDATE inventario SET stock_actual = ? WHERE id_inventario = ?
            ")->execute([$nuevoStock, $inv['id_inventario']]);

            $estado = $nuevoStock <= 0 ? 'Agotado' : 'Disponible';
            $db->prepare("
                UPDATE producto SET estado = ?
                WHERE id_producto = (
                    SELECT id_producto_fk FROM inventario WHERE id_inventario = ?
                )
            ")->execute([$estado, $inv['id_inventario']]);

            $db->commit();
            return ['ok' => true, 'mensaje' => 'Movimiento registrado correctamente.'];

        } catch (Exception $e) {
            $db->rollBack();
            return ['ok' => false, 'mensaje' => 'Error: ' . $e->getMessage()];
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STOCK ACTUAL
    // ─────────────────────────────────────────────────────────────────────────

    public static function obtenerStock(): array {
        $db   = DataBase::conectar();
        $stmt = $db->query("
            SELECT p.codigo, p.nombre, p.unidad, p.grupo, p.precio,
                   i.stock_minimo AS stockMin,
                   i.stock_actual AS stockActual
            FROM inventario i
            JOIN producto p ON i.id_producto_fk = p.id_producto
            ORDER BY p.nombre ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BÚSQUEDA GENERAL
    // ─────────────────────────────────────────────────────────────────────────

    public static function buscarProducto(string $q): array {
        $db   = DataBase::conectar();
        $like = '%' . $q . '%';
        $stmt = $db->prepare("
            SELECT p.codigo, p.nombre, p.unidad, p.grupo,
                   i.stock_minimo AS stockMin,
                   i.stock_actual AS stockActual
            FROM inventario i
            JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE p.codigo LIKE ? OR p.nombre LIKE ? OR p.grupo LIKE ?
            ORDER BY p.nombre ASC
        ");
        $stmt->execute([$like, $like, $like]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BÚSQUEDA POR CÓDIGO (autocompletado)
    // ─────────────────────────────────────────────────────────────────────────

    public static function buscarPorCodigo(string $q): array {
        $db   = DataBase::conectar();
        $like = $q . '%';
        $stmt = $db->prepare("
            SELECT p.codigo, p.nombre, p.grupo
            FROM producto p
            JOIN inventario i ON i.id_producto_fk = p.id_producto
            WHERE p.codigo LIKE ?
            ORDER BY p.codigo ASC
            LIMIT 10
        ");
        $stmt->execute([$like]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HISTORIAL
    // ─────────────────────────────────────────────────────────────────────────

    public static function obtenerHistorial(
        string $desde, string $hasta, string $tipo
    ): array {

        $db     = DataBase::conectar();
        $params = [$desde, $hasta];
        $filtro = $tipo ? ' AND m.tipo = ?' : '';
        if ($tipo) $params[] = $tipo;

        $stmt = $db->prepare("
            SELECT m.fecha, p.codigo, p.nombre AS producto,
                   m.tipo, m.cantidad, m.observaciones, m.created_at
            FROM movimiento_inventario m
            JOIN inventario i ON m.id_inventario_fk = i.id_inventario
            JOIN producto p   ON i.id_producto_fk   = p.id_producto
            WHERE m.fecha BETWEEN ? AND ? $filtro
            ORDER BY m.fecha DESC, m.created_at DESC
        ");
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDAR INTEGRIDAD
    // ─────────────────────────────────────────────────────────────────────────

    public static function validarIntegridad(): array {
        $db      = DataBase::conectar();
        $errores = [];

        $negativos = $db->query("
            SELECT p.codigo FROM inventario i
            JOIN producto p ON i.id_producto_fk = p.id_producto
            WHERE i.stock_actual < 0
        ")->fetchAll(PDO::FETCH_COLUMN);

        foreach ($negativos as $cod) {
            $errores[] = "Stock negativo en producto: $cod";
        }

        $sinInventario = $db->query("
            SELECT p.nombre FROM producto p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto_fk
            WHERE i.id_inventario IS NULL
        ")->fetchAll(PDO::FETCH_COLUMN);

        foreach ($sinInventario as $nom) {
            $errores[] = "Producto sin registro en inventario: $nom";
        }

        return ['errores' => $errores];
    }
}
?>
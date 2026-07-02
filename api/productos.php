<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Productos.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {

    case 'GET':
        // Listar inhabilitados
        if (!empty($_GET['inhabilitados'])) {
            responder(200, Producto::listarInhabilitados());
        }
        if (isset($_GET['id'])) {
            $producto = Producto::obtenerPorId((int) $_GET['id']);
            if ($producto) {
                responder(200, $producto);
            } else {
                responder(404, ['error' => 'Producto no encontrado']);
            }
        } else {
            responder(200, Producto::listarTodos());
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);

        // Manejar imagen base64
        $rutaImagen = trim($body['imagen'] ?? '');
        if (!empty($body['imagen_base64'])) {
            $rutaImagen = guardarImagenBase64(
                $body['imagen_base64'],
                $body['imagen_extension'] ?? 'jpg'
            );
            if (!$rutaImagen) responder(500, ['error' => 'No se pudo guardar la imagen']);
        }

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        $resultado = Producto::crear(
            trim($body['nombre']),
            (float) $body['precio'],
            trim($body['talla']  ?? ''),
            trim($body['color']  ?? ''),
            $rutaImagen,
            trim($body['estado'] ?? 'Disponible')
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ya existe un producto con ese nombre']);
        } elseif ($resultado) {
            responder(201, ['mensaje' => 'Producto creado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo crear el producto']);
        }
        break;

    case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['id_producto'])) responder(400, ['error' => 'El campo id_producto es obligatorio']);

        // Inhabilitar / habilitar
        if (isset($body['inhabilitado'])) {
            $resultado = Producto::toggleInhabilitado(
                (int) $body['id_producto'],
                (bool) $body['inhabilitado']
            );
            if ($resultado) {
                responder(200, ['mensaje' => $body['inhabilitado'] ? 'Producto inhabilitado' : 'Producto habilitado']);
            } else {
                responder(500, ['error' => 'No se pudo actualizar el producto']);
            }
        }

        $error = validarCampos($body);
        if ($error) responder(400, ['error' => $error]);

        $producto = Producto::obtenerPorId((int) $body['id_producto']);
        if (!$producto) responder(404, ['error' => 'Producto no encontrado']);

        // Manejar imagen base64
        $rutaImagen = trim($body['imagen'] ?? $producto['imagen'] ?? '');
        if (!empty($body['imagen_base64'])) {
            $rutaImagen = guardarImagenBase64(
                $body['imagen_base64'],
                $body['imagen_extension'] ?? 'jpg'
            );
            if (!$rutaImagen) responder(500, ['error' => 'No se pudo guardar la imagen']);
        }

        $resultado = Producto::actualizar(
            (int)   $body['id_producto'],
            trim(   $body['nombre']),
            (float) $body['precio'],
            trim(   $body['talla']  ?? ''),
            trim(   $body['color']  ?? ''),
            $rutaImagen,
            trim(   $body['estado'] ?? 'Disponible')
        );

        if ($resultado === 'exist') {
            responder(409, ['error' => 'Ya existe otro producto con ese nombre']);
        } elseif ($resultado) {
            responder(200, ['mensaje' => 'Producto actualizado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo actualizar el producto']);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) responder(400, ['error' => 'ID inválido o no proporcionado']);
        $producto = Producto::obtenerPorId($id);
        if (!$producto) responder(404, ['error' => 'Producto no encontrado']);
        if (Producto::eliminar($id)) {
            responder(200, ['mensaje' => 'Producto eliminado correctamente']);
        } else {
            responder(500, ['error' => 'No se pudo eliminar el producto']);
        }
        break;

    default:
        responder(405, ['error' => 'Método no permitido']);
}

function guardarImagenBase64(string $base64, string $extension): string|false {
    if (str_contains($base64, ',')) {
        [, $base64] = explode(',', $base64, 2);
    }
    $datos = base64_decode($base64);
    if (!$datos) return false;
    $extension  = preg_replace('/[^a-z0-9]/i', '', $extension) ?: 'jpg';
    $nombreArch = 'producto_' . time() . '_' . rand(100, 999) . '.' . $extension;
    $carpeta    = BASE_PATH . '/uploads/productos/';
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);
    if (file_put_contents($carpeta . $nombreArch, $datos) === false) return false;
    return 'uploads/productos/' . $nombreArch;
}

function validarCampos(?array $body): ?string {
    if (empty($body)) return 'El cuerpo de la petición está vacío';
    foreach (['nombre', 'precio'] as $campo) {
        if (!isset($body[$campo]) || trim((string)$body[$campo]) === '') {
            return "El campo '$campo' es obligatorio";
        }
    }
    if (!is_numeric($body['precio']) || (float)$body['precio'] <= 0) {
        return 'El precio debe ser un número mayor a 0';
    }
    if (isset($body['estado']) && !in_array($body['estado'], ['Disponible', 'Agotado'])) {
        return 'El estado debe ser Disponible o Agotado';
    }
    return null;
}

function responder(int $codigo, array $datos): never {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
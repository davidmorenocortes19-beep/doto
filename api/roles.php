<?php
require_once 'config.php';
require_once BASE_PATH . '/core/DataBase.php';

$db   = Database::conectar();
$stmt = $db->query('SELECT id_rol, nombre_rol FROM rol ORDER BY id_rol ASC');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
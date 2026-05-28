<?php
class AuthMiddleware {

    public static function verificarSesion() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($SESSION['usuario'])) {
            header("location: index.php?route=login");
            exit;
        }
    }
}
?>
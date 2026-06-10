<?php

require_once BASE_PATH . '/core/Database.php';

class Usuario {

    // ── REGISTRO PÚBLICO (rol Cliente = 2 por defecto) ───────────────
    public static function registrar($nombre, $documento, $correo, $telefono, $direccion, $password) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_usuario FROM usuario WHERE documento = ? OR correo = ?");
        $stmt->execute([$documento, $correo]);
        if ($stmt->fetch()) return "exist";

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO usuario (nombre, documento, correo, telefono, direccion, password, id_rol_fk)
            VALUES (?, ?, ?, ?, ?, ?, 2)
        ");

        return $stmt->execute([$nombre, $documento, $correo, $telefono, $direccion, $hash]);
    }

    // ── CREAR USUARIO DESDE ADMIN ────────────────────────────────────
    public static function crearUsuarioAdmin($nombre, $documento, $correo, $telefono, $direccion, $password, $id_rol) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("SELECT id_usuario FROM usuario WHERE documento = ? OR correo = ?");
        $stmt->execute([$documento, $correo]);
        if ($stmt->fetch()) return "exist";

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO usuario (nombre, documento, correo, telefono, direccion, password, id_rol_fk)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        return $stmt->execute([$nombre, $documento, $correo, $telefono, $direccion, $hash, $id_rol]);
    }

    // ── LISTAR TODOS ─────────────────────────────────────────────────
    public static function listarTodos() {

        $db = DataBase::conectar();

        $stmt = $db->query("
            SELECT u.id_usuario, u.nombre, u.documento, u.correo,
                   u.telefono, u.direccion, u.id_rol_fk, r.nombre_rol
            FROM usuario u
            INNER JOIN rol r ON u.id_rol_fk = r.id_rol
            ORDER BY u.nombre ASC
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── OBTENER UNO POR ID ───────────────────────────────────────────
    public static function obtenerPorId($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT u.id_usuario, u.nombre, u.documento, u.correo,
                   u.telefono, u.direccion, u.id_rol_fk, r.nombre_rol
            FROM usuario u
            INNER JOIN rol r ON u.id_rol_fk = r.id_rol
            WHERE u.id_usuario = ?
        ");

        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ── ACTUALIZAR USUARIO ───────────────────────────────────────────
    public static function actualizar($id, $nombre, $documento, $correo, $telefono, $direccion, $id_rol) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT id_usuario FROM usuario
            WHERE (documento = ? OR correo = ?) AND id_usuario <> ?
        ");
        $stmt->execute([$documento, $correo, $id]);
        if ($stmt->fetch()) return "exist";

        $stmt = $db->prepare("
            UPDATE usuario
            SET nombre    = ?,
                documento = ?,
                correo    = ?,
                telefono  = ?,
                direccion = ?,
                id_rol_fk = ?
            WHERE id_usuario = ?
        ");

        return $stmt->execute([$nombre, $documento, $correo, $telefono, $direccion, $id_rol, $id]);
    }

    // ── ACTUALIZAR CONTRASEÑA ────────────────────────────────────────
    public static function actualizarPassword($id, $password) {

        $db   = DataBase::conectar();
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("UPDATE usuario SET password = ? WHERE id_usuario = ?");
        return $stmt->execute([$hash, $id]);
    }

    // ── ELIMINAR ─────────────────────────────────────────────────────
    public static function eliminar($id) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("DELETE FROM usuario WHERE id_usuario = ?");
        return $stmt->execute([$id]);
    }

    // ── LOGIN ────────────────────────────────────────────────────────
    public static function login($correo, $password) {

        $db = DataBase::conectar();

        $stmt = $db->prepare("
            SELECT u.*, r.nombre_rol
            FROM usuario u
            INNER JOIN rol r ON u.id_rol_fk = r.id_rol
            WHERE u.correo = ?
        ");

        $stmt->execute([$correo]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($password, $usuario['password'])) {
            return $usuario;
        }

        return false;
    }
}
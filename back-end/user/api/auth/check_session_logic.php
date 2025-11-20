<?php
// check_session_logic.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireLogin() {
    if (!isset($_SESSION['connecte']) || $_SESSION['connecte'] !== true) {
        throw new Exception("Utilisateur non connecté");
    }
}

function requireAdmin() {
    requireLogin();
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Utilisateur non autorisé");
    }
}
?>
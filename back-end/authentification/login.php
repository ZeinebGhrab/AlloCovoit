<?php
session_start();
require_once 'User.php';
require_once '../config/Database.php';

// Vérifier si le formulaire a été soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $mot_de_passe = $_POST['mot_passe'] ?? '';

    $db = new Database();
    $user = new User($db);
    $user->login($email, $mot_de_passe);

    $db->close();
}
?>

<?php
header('Content-Type: application/json');

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$email = $_POST['email'] ?? '';
$mot_de_passe = $_POST['mot_passe'] ?? '';

if (empty($email) || empty($mot_de_passe)) {
    echo json_encode(['success' => false, 'message' => 'Veuillez remplir tous les champs.']);
    exit;
}

require_once '../config/Database.php';
require_once 'User.php';

$db = new Database();
$user = new User($db);

$result = $user->login($email, $mot_de_passe);

if ($result) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect.']);
}

$db->close();
?>
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Vérifier la méthode POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée.');
    }

    $email = $_POST['email'] ?? '';
    $mot_de_passe = $_POST['mot_passe'] ?? '';

    if (empty($email) || empty($mot_de_passe)) {
        throw new Exception('Veuillez remplir tous les champs.');
    }

    require_once '../../../config/Database.php';
    require_once '../../models/User.php';

    $db = new Database();
    $user = new User($db);

    $loginResult = $user->login($email, $mot_de_passe);

    if ($loginResult) {
        // Vérifier si le statut du compte est inactif
        if ($_SESSION['statut'] === 'inactif') {
            echo json_encode([
                'success' => false,
                'message' => 'Votre compte est inactif. Veuillez contacter l\'administrateur.'
            ]);
            exit;
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'email' => $user->getEmail(),
                'role' => $_SESSION['role'],
                'statut' => $_SESSION['statut']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect.'
        ]);
    }

    $db->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

<?php

header('Content-Type: application/json');

require_once '../../authentification/check_session.php';
require_once '../../config/Database.php';
require_once '../models/TrajetManager.php';

try {
    // Vérifier que l'utilisateur est connecté
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Utilisateur non connecté']);
        exit();
    }

    // Lire le JSON reçu
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    // Vérifier que l'ID du trajet est présent
    if (!isset($data['id_trajet'])) {
        echo json_encode(['success' => false, 'error' => 'ID trajet manquant']);
        exit();
    }

    $manager = new TrajetManager();
    $idTrajet = intval($data['id_trajet']);

    $success = $manager->cancel($idTrajet);
    $manager->close();

    echo json_encode(['success' => $success]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

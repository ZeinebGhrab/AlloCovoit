<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../../user/api/auth/check_session.php';
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

    $success = $manager->delete($idTrajet,$_SESSION['user_id']);
    $manager->close();

    // Supprimer toute sortie éventuelle avant le JSON
    ob_clean();
    echo json_encode(['success' => $success]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
// Vider et arrêter le buffer
ob_end_flush();
?>

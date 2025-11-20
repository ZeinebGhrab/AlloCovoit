<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../../user/api/auth/check_session_logic.php';
require_once '../../config/Database.php';
require_once '../models/TrajetManager.php';

try {
    // Vérifier si l'utilisateur est connecté
    requireLogin();

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

    if ($success ) {
        echo json_encode(['success' => true, 'message' => 'Trajet supprimé avec succès.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Impossible de supprimer ce trajet.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
// Vider et arrêter le buffer
ob_end_flush();
?>

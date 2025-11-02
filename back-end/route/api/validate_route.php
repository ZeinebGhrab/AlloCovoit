<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Méthode non autorisée");
    }

    // Vérifier l'ID du trajet
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['id_trajet'])) {
        throw new Exception("ID du trajet manquant");
    }

    $id = (int) $data['id_trajet'];
    $manager = new TrajetManager();

    // Valider le trajet
    if ($manager->validateRoute($id)) {
        ob_clean();
        echo json_encode([
            "success" => true,
            "message" => "Trajet validé avec succès",
            "id_trajet" => $id
        ]);
    } else {
        throw new Exception("Erreur lors de la validation du trajet");
    }

    $manager->close();

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);

ob_end_flush();
}

<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Méthode non autorisée");
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['id_trajet'])) {
        throw new Exception("ID du trajet manquant");
    }

    $id = (int) $data['id_trajet'];
    $manager = new TrajetManager();

    // Refuser le trajet
    if ($manager->refuseRoute($id)) {
        echo json_encode([
            "success" => true,
            "message" => "Trajet refusé avec succès",
            "id_trajet" => $id
        ]);
    } else {
        throw new Exception("Erreur lors du refus du trajet");
    }

    $manager->close();

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

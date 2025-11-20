<?php

// Empêcher tout output parasite
ob_start();

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session_logic.php';


try {
    
    // Vérifier si l'utilisateur est connecté
    requireLogin();

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
        ob_clean();
        echo json_encode([
            "success" => true,
            "message" => "Trajet refusé avec succès",
        ]);
    } else {
        throw new Exception("Erreur lors du refus du trajet");
    }

    $manager->close();

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

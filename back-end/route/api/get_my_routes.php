<?php
// Toujours au tout début du fichier, avant tout espace ou saut de ligne
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Vérifier que aucune sortie n'est faite avant le JSON
ob_start();

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../authentification/check_session.php';

try {
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) throw new Exception("Utilisateur non connecté");

    $manager = new TrajetManager();

    // Récupérer les filtres depuis l'URL
    $filters = [
        'depart' => $_GET['depart'] ?? '',
        'arrivee' => $_GET['arrivee'] ?? '',
        'date' => $_GET['date'] ?? '',
        'user_id' => $userId
    ];

    $rawTrajets = $manager->getMyRoutes($userId);


    $trajets = [];
    foreach ($rawTrajets as $t) {
        $trajet = new Trajet($t);
        $trajets[] = [
            'id_trajet' => $trajet->getId(),
            'ville_depart' => $trajet->getDepart(),
            'ville_arrivee' => $trajet->getArrivee(),
            'date_depart' => $trajet->getDate(),
            'heure_depart' => $trajet->getHeure(),
            'prix' => $trajet->getPrix(),
            'places_disponibles' => $trajet->getPlaces(),
            'description' => $trajet->getDescription(),
            'conducteur_nom' => $trajet->getConducteur(),
            'statut' => $trajet->getStatut()
        ];
    }

    // Supprimer toute sortie éventuelle avant le JSON
    ob_clean();

    echo json_encode($trajets);

    $manager->close();
} catch (Exception $e) {
    ob_clean();
    echo json_encode(['error' => $e->getMessage()]);
}

// Vider et arrêter le buffer
ob_end_flush();
?>

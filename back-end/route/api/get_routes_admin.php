<?php
// Toujours au tout début du fichier, avant tout espace ou saut de ligne
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session.php';

try {
    // Vérifier utilisateur connecté
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        throw new Exception("Utilisateur non connecté");
    }

    // Vérifier que l'utilisateur est un admin
    if ($_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => "Utilisateur non autorisé"]);
        exit();
    }

    $manager = new TrajetManager();

    // Récupérer les filtres depuis l'URL
    $filters = [
        'depart' => $_GET['depart'] ?? '',
        'arrivee' => $_GET['arrivee'] ?? '',
        'date' => $_GET['date'] ?? ''
    ];

    // Pagination
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $offset = ($page - 1) * $limit;

    // Récupérer tous les trajets (administrateur)
    $rawTrajets = $manager->getAll($filters, 'date_depart', 'ASC', $page, $limit); 

   // Compter le total des trajets pour pagination
    $total = count($rawTrajets);
    $totalPages = ceil($total / $limit);

    // Transformer chaque ligne en objet Trajet
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
            'conducteur_nom' => $t['conducteur_nom'],
            'conducteur_prenom' => $t['conducteur_prenom'],
            'statut' => $trajet->getStatut(),
            'valider' => $trajet->getValider()
        ];
    }

    // Supprimer toute sortie éventuelle avant le JSON
    ob_clean();

    echo json_encode([
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'totalPages' => $totalPages,
        'trajets' => $trajets
    ]);

    $manager->close();

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

// Vider et arrêter le buffer
ob_end_flush();
?>

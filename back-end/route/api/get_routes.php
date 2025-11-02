<?php
// Toujours au tout début du fichier, avant tout espace ou saut de ligne
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session.php'; // ne pas modifier

try {
    // Vider tout output accidentel
    if (ob_get_length()) {
        ob_clean();
    }

    // Vérifier utilisateur connecté
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        throw new Exception("Utilisateur non connecté");
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

    // Récupérer tous les trajets validés
    $rawTrajets = $manager->getAllValidate($filters, 'date_depart', 'ASC', $page, $limit); 

    // Transformer chaque ligne en tableau prêt pour JSON
    $trajets = [];
    foreach ($rawTrajets as $t) {
        $trajets[] = [
            'id_trajet' => $t['id_trajet'],
            'ville_depart' => $t['ville_depart'],
            'ville_arrivee' => $t['ville_arrivee'],
            'date_depart' => $t['date_depart'],
            'heure_depart' => $t['heure_depart'],
            'prix' => $t['prix'],
            'places_disponibles' => $t['places_disponibles'],
            'description' => $t['description'],
            'conducteur_nom' => $t['conducteur_nom'] ?? '', // utiliser la valeur directement du join
            'conducteur_prenom' => $t['conducteur_prenom'] ?? '',
            'statut' => $t['statut'],
            'valider' => $t['valider'] ?? 0
        ];
    }

    // Compter le total pour pagination
    $total = count($trajets);
    $totalPages = ceil($total / $limit);

    // Envoyer le JSON final
    echo json_encode([
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'totalPages' => $totalPages,
        'trajets' => $trajets
    ]);

    $manager->close();

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    echo json_encode(['error' => $e->getMessage()]);
}


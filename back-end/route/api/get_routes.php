<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session_logic.php';

try {
    
    // Vérifier si l'utilisateur est connecté
    requireLogin();

    $userId = (int)$_SESSION['user_id'];
    $manager = new TrajetManager();

    // Récupérer les filtres depuis le corps de la requête
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $filters = [
        'depart'  => $input['depart'] ?? '',
        'arrivee' => $input['arrivee'] ?? '',
        'date'    => $input['date'] ?? ''
    ];

    // Pagination
    $page = isset($input['page']) ? max(1, intval($input['page'])) : 1;
    $limit = isset($input['limit']) ? max(1, intval($input['limit'])) : 10;
    $offset = ($page - 1) * $limit;

    // Récupérer tous les trajets validés (avec pagination)
    $rawTrajets = $manager->getAllValidate($userId, $filters, 'date_depart', 'ASC', $offset, $limit);

    // Compter le total réel pour pagination
    $total = $manager->countValidate($userId, $filters); 
    $totalPages = ceil($total / $limit);

    // Transformer chaque ligne en tableau JSON
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
            'conducteur_nom' => $t['conducteur_nom'] ?? '',
            'conducteur_prenom' => $t['conducteur_prenom'] ?? '',
            'statut' => $t['statut'],
            'valider' => $t['valider'] ?? 0
        ];
    }

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    echo json_encode([
        'success'    => true,
        'page'       => $page,
        'limit'      => $limit,
        'total'      => $total,
        'totalPages' => $totalPages,
        'trajets'    => $trajets
    ]);

    $manager->close();
    exit;

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

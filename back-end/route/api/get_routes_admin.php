<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session_logic.php';

try {

    // Vérifier si l'utilisateur est connecté et admin
    requireLogin();
    requireAdmin();

    $manager = new TrajetManager();

    // Pagination
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    $page = max(1, intval($input['page'] ?? 1));
    $limit = max(1, intval($input['limit'] ?? 5));
    $search = $input['search'] ? $input['search'] :  '';

    // Récupérer les trajets avec pagination
    $rawTrajets = $manager->getAll($page, $limit, $search);

    // Transformer les trajets en tableau JSON utilisable
    $trajets = [];
    foreach ($rawTrajets['trajets'] as $t) {
        $trajet = new Trajet($t);
        $trajets[] = [
            'id_trajet' => $trajet->getId(),
            'ville_depart' => $trajet->getDepart(),
            'ville_arrivee' => $trajet->getArrivee(),
            'date_depart' => $trajet->getDate(),
            'heure_depart' => $trajet->getHeure(),
            'prix' => $trajet->getPrix(),
            'places_disponibles' => $trajet->getPlaces(),
            'places_reservees'=> $trajet->getPlacesReservees(),
            'description' => $trajet->getDescription(),
            'conducteur_nom' => $t['conducteur_nom'] ?? '',
            'conducteur_prenom' => $t['conducteur_prenom'] ?? '',
            'conducteur_email' => $t['conducteur_email'] ?? '',
            'conducteur_telephone' => $t['conducteur_telephone'] ?? '',
            'statut' => $trajet->getStatut(),
            'valider' => $trajet->getValider()
        ];
    }

    // Retour JSON
    ob_clean();
    echo json_encode([
        'success' => true,
        'page' => $rawTrajets['page'],
        'limit' => $limit,
        'total' => $rawTrajets['total'],
        'totalPages' => $rawTrajets['totalPages'],
        'trajets' => $trajets
    ], JSON_PRETTY_PRINT);

    $manager->close();
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}
?>
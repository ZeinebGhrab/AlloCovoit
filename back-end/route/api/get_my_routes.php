<?php
// Démarrer le buffer de sortie pour capturer toute sortie non désirée
ob_start();

// Configuration des erreurs
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session_logic.php';

try {

    // Vérifier si l'utilisateur est connecté
    requireLogin();

    $userId = (int)$_SESSION['user_id'];
    $manager = new TrajetManager();

    // Récupérer les paramètres de pagination depuis le corps JSON
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $page = max(1, intval($input['page'] ?? 1));
    $limit = max(1, min(100, intval($input['limit'] ?? 10)));
    $filters = $input['filters'] ?? [];

    // Extraire le filtre de statut si fourni
    $statutFilter = isset($filters['statut']) && $filters['statut'] !== 'tous'
                    ? $filters['statut']
                    : null;

    // Récupérer tous les trajets du conducteur
    $rawTrajets = $manager->getMyRoutes($userId, $statutFilter, $page, $limit);
    
    // Calculer le total de trajets pour ce conducteur
    $total = $manager->countMyRoutes($userId);
    $totalPages = ceil($total / $limit);

    // Transformer les trajets en tableau JSON
    $trajets = [];
    foreach ($rawTrajets as $t) {
        $trajets[] = [
            'id_trajet' => (int)$t['id_trajet'],
            'ville_depart' => $t['ville_depart'],
            'ville_arrivee' => $t['ville_arrivee'],
            'date_depart' => $t['date_depart'],
            'heure_depart' => $t['heure_depart'],
            'prix' => (float)$t['prix'],
            'places_disponibles' => (int)$t['places_disponibles'],
            'places_reservees' => (int)($t['places_reservees'] ?? 0),
            'description' => $t['description'] ?? '',
            'conducteur_nom' => $t['conducteur_nom'] ?? '',
            'conducteur_prenom' => $t['conducteur_prenom'] ?? '',
            'statut' => $t['statut'] ?? 'en_attente',
            'valider' => (int)($t['valider'] ?? 0)
        ];
    }

    $manager->close();

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

    exit;

} catch (Exception $e) {

    ob_end_clean();

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    exit;
}
?>
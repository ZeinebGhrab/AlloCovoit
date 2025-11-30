<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/ReservationManager.php';
require_once '../../user/api/auth/check_session_logic.php';

try {
    // Vérifier la session utilisateur
    requireLogin();

    $conducteurId = (int) $_SESSION['user_id'];

    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $page = max(1, intval($input['page'] ?? 1));
    $limit = max(1, min(100, intval($input['limit'] ?? 10)));
    $filters = $input['filters'] ?? 'tous';

    $requests = $manager->getReceivedRequests($conducteurId, $page, $limit, $filters);

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    echo json_encode([
        'success' => true,
        'received_requests' => $requests['items'],
        'pagination' => $requests['pagination']
    ], JSON_UNESCAPED_UNICODE);

    $manager->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

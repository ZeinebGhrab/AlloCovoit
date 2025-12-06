<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../../config/Database.php';
require_once '../models/ReservationManager.php';
require_once '../../user/api/auth/check_session_logic.php';

try {
    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est un admin
    requireAdmin();

    // Connexion à la base
    $database = new Database();
    $conn = $database->connect();

    // Pagination
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $page = max(1, intval($input['page'] ?? 1));
    $limit = max(1, intval($input['limit'] ?? 5));
    $search = $input['search'] ? $input['search'] :  '';

    $reservationManager = new ReservationManager($conn);
    $reservationData = $reservationManager->getAllReservations($page, $limit, $search);

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    echo json_encode([
        'success' => true,
        'reservations' => $reservationData['reservations'],
        'page' => $reservationData['page'],
        'limit' => $reservationData['limit'],
        'total' => $reservationData['total'],
        'totalPages' => $reservationData['totalPages']
    ]);

    $reservationManager->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

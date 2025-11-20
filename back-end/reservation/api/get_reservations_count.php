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

    $userId = (int) $_SESSION['user_id'];

    // Connexion à la base
    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    // Récupérer les deux compteurs
    $userReservationCount = $manager->getUserReservationCount($userId);
    $driverRequestCount = $manager->getReceivedRequestsCount($userId);
    $reservationCount = $manager->countAllReservations();

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    // Réponse combinée
    echo json_encode([
        'success' => true,
        'user_id' => $userId,
        'counts' => [
            'user_reservations' => $userReservationCount,
            'received_requests' => $driverRequestCount,
            'totalReservations'=> $reservationCount
        ]
    ], JSON_UNESCAPED_UNICODE);

    $manager->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

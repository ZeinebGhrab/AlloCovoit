<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/ReservationManager.php';

try {
    if (empty($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Utilisateur non connecté.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $conducteurId = (int) $_SESSION['user_id'];

    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    $requests = $manager->getReceivedRequests($conducteurId);

    echo json_encode([
        'success' => true,
        'received_requests' => $requests
    ], JSON_UNESCAPED_UNICODE);

    $manager->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

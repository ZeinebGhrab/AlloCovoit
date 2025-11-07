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

    $input = json_decode(file_get_contents('php://input'), true);
    $reservationId = isset($input['id_reservation']) ? (int)$input['id_reservation'] : 0;

    if ($reservationId <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de réservation invalide.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    $result = $manager->confirmReservation($reservationId);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Réservation confirmée avec succès.'], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['success' => false, 'message' => 'Impossible de confirmer la réservation.'], JSON_UNESCAPED_UNICODE);
    }

    $manager->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

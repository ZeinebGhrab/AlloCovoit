<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/ReservationManager.php';

try {
    // Vérifier si l'utilisateur est connecté
    if (empty($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Utilisateur non connecté.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $userId = (int) $_SESSION['user_id'];

    // Connexion à la base
    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    // Récupérer les réservations
    $reservations = $manager->getUserReservations($userId);

    echo json_encode([
        'success' => true,
        'user_id' => $userId,
        'reservations' => $reservations
    ], JSON_UNESCAPED_UNICODE);

    $manager->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

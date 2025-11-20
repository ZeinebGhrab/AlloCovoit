<?php
// Toujours au tout début du fichier : aucun espace avant <?php
ini_set('display_errors', 0); // désactiver affichage erreurs pour l'utilisateur
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once '../../user/api/auth/check_session_logic.php';

try {
   // Vérifier la session utilisateur
   requireLogin();

    // Récupérer l'ID de réservation depuis le JSON reçu
    $input = json_decode(file_get_contents('php://input'), true);
    $reservationId = isset($input['id_reservation']) ? (int)$input['id_reservation'] : 0;
    if ($reservationId <= 0) {
        throw new Exception("ID de réservation invalide.");
    }

    // Connexion à la base
    require_once '../../config/Database.php';
    require_once '../models/ReservationManager.php';

    $database = new Database();
    $conn = $database->connect();
    $manager = new ReservationManager($conn);

    // Essayer d'annuler la réservation
    $success = $manager->cancelReservation($reservationId);

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Réservation annulée avec succès.'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Impossible d’annuler la réservation.'
        ], JSON_UNESCAPED_UNICODE);
    }

    $manager->close();

} catch (Exception $e) {
    // Nettoyer toute sortie accidentelle et renvoyer un JSON d'erreur
    if (ob_get_length()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Erreur : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

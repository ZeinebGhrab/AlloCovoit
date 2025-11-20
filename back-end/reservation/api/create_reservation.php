<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/ReservationManager.php';
require_once '../../user/api/auth/check_session_logic.php';

// Vérifier la session utilisateur
requireLogin();

$userId = (int) $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);
$trajets = $input['trajets'] ?? [];

if (empty($trajets) || !is_array($trajets)) {
    echo json_encode(['success' => false, 'message' => 'Aucun trajet à confirmer.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$database = new Database();
$conn = $database->connect();
$manager = new ReservationManager($conn);

$trajetsConfirmes = 0;
$erreurs = [];

usort($trajets, fn($a, $b) => ($a['id'] ?? 0) <=> ($b['id'] ?? 0));

try {
    $conn->begin_transaction();

    foreach ($trajets as $trajet) {
        $trajetId = (int) ($trajet['id'] ?? 0);
        $places = (int) ($trajet['nombre_places'] ?? 1);
        $message = $trajet['message'] ?? '';

        if ($trajetId <= 0 || $places <= 0) {
            $erreurs[] = "Données invalides pour le trajet ID $trajetId";
            continue;
        }

        $check = $conn->prepare("SELECT COUNT(*) AS total FROM reservation WHERE id_utilisateur = ? AND id_trajet = ?");
        $check->bind_param("ii", $userId, $trajetId);
        $check->execute();
        $result = $check->get_result()->fetch_assoc();
        $check->close();

        if ($result['total'] > 0) {
            $erreurs[] = "Réservation déjà effectuée pour le trajet ID $trajetId";
            continue;
        }

        // Appeler addReservation et récupérer le résultat
        $resultAdd = $manager->addReservation($userId, $trajetId, $places, $message);

        if (!$resultAdd['success']) {
            $erreurs[] = $resultAdd['message'];
            continue;
        }

        // Mise à jour des places réservées
        $update = $conn->prepare("UPDATE trajet SET places_reservees = places_reservees + ? WHERE id_trajet = ?");
        $update->bind_param("ii", $places, $trajetId);
        $update->execute();
        $update->close();

        $trajetsConfirmes++;
    }

    $conn->commit();
    $_SESSION['panier'] = [];

    // Construire un message unique clair
    $messageFinal = $trajetsConfirmes > 0
        ? "$trajetsConfirmes réservation(s) confirmée(s) avec succès."
        : (count($erreurs) > 0 ? $erreurs[0] : "Impossible de confirmer les réservations.");

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    echo json_encode([
        'success' => $trajetsConfirmes > 0,
        'message' => $messageFinal,
        'erreurs' => $erreurs,
        'count' => $trajetsConfirmes
    ], JSON_UNESCAPED_UNICODE);

    $manager->close();
    exit;

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    $manager->close();
    exit;
}
?>

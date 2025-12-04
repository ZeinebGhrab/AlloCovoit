<?php
require_once '../../config/Database.php';
require_once '../models/TrajetManager.php';
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
requireLogin();

$trajetManager = new TrajetManager();
$totalRevenue = $trajetManager->getTotalRevenue();

// Nettoyer le buffer avant d'envoyer le JSON
ob_end_clean();

echo json_encode([
    'totalRevenue' => $totalRevenue 
]);
?>

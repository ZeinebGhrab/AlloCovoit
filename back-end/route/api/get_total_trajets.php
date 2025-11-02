<?php
require_once '../../config/Database.php';
require_once '../models/TrajetManager.php';

header('Content-Type: application/json');

$trajetManager = new TrajetManager();
$totalTrajets = $trajetManager->countAllTrajets();

echo json_encode([
    'totalTrajets' => $totalTrajets
]);
?>

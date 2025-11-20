<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../../models/UserManager.php';
require_once '../auth/check_session_logic.php';

try {
    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est un admin
    requireAdmin();

    // Pagination depuis POST
    $page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
    $limit = isset($_POST['limit']) ? max(1, intval($_POST['limit'])) : 6;

    $userManager = new UserManager();
    $usersData = $userManager->getAllUsers($page, $limit);

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    echo json_encode([
        'success' => true,
        'users' => $usersData['users'],
        'page' => $usersData['page'],
        'limit' => $usersData['limit'],
        'total' => $usersData['total'],
        'totalPages' => $usersData['totalPages']
    ]);

    $userManager->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

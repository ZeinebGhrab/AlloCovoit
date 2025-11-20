<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../models/UserManager.php';
require_once '../auth/check_session_logic.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée.');
    }

    // Vérifier que l'utilisateur est connecté
    requireLogin();

    // Vérifier que l'utilisateur est un admin
    requireAdmin();

    $id = $_POST['id'] ?? null;
    if (!$id) throw new Exception('ID utilisateur manquant.');

    $manager = new UserManager();
    $res = $manager->unblockUser(intval($id));
    $manager->close();

    // Nettoyer le buffer avant d'envoyer le JSON
    ob_end_clean();

    if ($res) {
        echo json_encode(['success' => true, 'message' => 'Utilisateur débloqué avec succès.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Impossible de débloquer cet utilisateur.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

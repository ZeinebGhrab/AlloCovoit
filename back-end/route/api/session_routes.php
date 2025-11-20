<?php
session_start();
require_once '../../user/api/auth/check_session_logic.php';

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
requireLogin();

if (!isset($_SESSION['panier'])) {
    $_SESSION['panier'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {

    case 'GET':
        // Renvoyer le panier actuel
        echo json_encode([
            'success' => true,
            'cart' => $_SESSION['panier']
        ]);
        break;

    case 'POST':
        // Ajouter un trajet au panier
        if (!$data || !isset($data['id'])) {
            echo json_encode(['success' => false, 'message' => 'Données invalides']);
            exit;
        }

        // Vérifier doublon
        foreach ($_SESSION['panier'] as $item) {
            if ($item['id'] === $data['id']) {
                echo json_encode(['success' => false, 'message' => 'Ce trajet est déjà dans le panier']);
                exit;
            }
        }

        $_SESSION['panier'][] = $data;

        echo json_encode([
            'success' => true,
            'message' => 'Trajet ajouté au panier',
            'cart' => $_SESSION['panier'] // On renvoie le panier mis à jour
        ]);
        break;

    case 'DELETE':
        // Supprimer un trajet
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID manquant']);
            exit;
        }

        $_SESSION['panier'] = array_values(array_filter($_SESSION['panier'], fn($item) => $item['id'] !== $id));

        echo json_encode([
            'success' => true,
            'message' => 'Trajet retiré du panier',
            'cart' => $_SESSION['panier'] // Renvoyer le panier à jour
        ]);
        break;

    case 'PUT':
        // Vider complètement le panier
        $_SESSION['panier'] = [];

        echo json_encode([
            'success' => true,
            'message' => 'Panier vidé',
            'cart' => [] // Panier vide renvoyé
        ]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        break;
}
?>

<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../../user/api/auth/check_session_logic.php';

// Vérifier si l'utilisateur est connecté
requireLogin();


$database = new Database();
$db = $database->connect();


$trajet = new Trajet($_POST);


$data = [
    'id_conducteur' => $_SESSION['user_id'],
    'ville_depart' => $_POST['Ville_depart'],
    'ville_arrivee' => $_POST['Ville_arrivee'],
    'date_depart' => $_POST['date_publication'],
    'heure_depart' => $_POST['heure_depart'],
    'prix' => $_POST['prix'],
    'places_disponibles' => $_POST['places_disponibles'],
    'description' => $_POST['description'] ?? ''
];

if ($trajet->save($data, $db)) {
     header("Location: /AlloCovoit/front-end/interfaces/main.html");
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement']);
}
?>



<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../../authentification/check_session.php';


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
    header("Location: ../../../front-end/interfaces/main.html");
    exit();
} else {
    echo "Erreur lors de l'enregistrement du trajet.";
}
?>



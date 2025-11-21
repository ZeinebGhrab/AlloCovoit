<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once '../../config/Database.php';
require_once '../models/Trajet.php';
require_once '../../user/api/auth/check_session_logic.php';

// Vérifier si l'utilisateur est connecté
requireLogin();

$database = new Database();
$db = $database->connect();

$trajet = new Trajet($_POST);

// Récupérer les données du formulaire
$ville_depart = $_POST['Ville_depart'] ?? '';
$ville_arrivee = $_POST['Ville_arrivee'] ?? '';
$date_depart = $_POST['date_publication'] ?? '';
$heure_depart = $_POST['heure_depart'] ?? '';
$prix = $_POST['prix'] ?? '';
$places = $_POST['places_disponibles'] ?? '';
$description = $_POST['description'] ?? '';

// Vérifications côté serveur
if (!$ville_depart || !$ville_arrivee || !$date_depart || !$heure_depart || !$prix || !$places) {
    echo json_encode(['success' => false, 'message' => 'Veuillez remplir tous les champs']);
    exit;
}

if ($places < 1 || $places > 5) {
    echo json_encode(['success' => false, 'message' => 'Le nombre de places doit être entre 1 et 5']);
    exit;
}

// Vérifier que la date et l'heure sont dans le futur
$selectedDateTime = DateTime::createFromFormat('Y-m-d H:i', "$date_depart $heure_depart");
$now = new DateTime();

if (!$selectedDateTime || $selectedDateTime <= $now) {
    echo json_encode(['success' => false, 'message' => 'La date et l’heure doivent être dans le futur']);
    exit;
}

// Préparer les données à enregistrer
$data = [
    'id_conducteur' => $_SESSION['user_id'],
    'ville_depart' => $ville_depart,
    'ville_arrivee' => $ville_arrivee,
    'date_depart' => $date_depart,
    'heure_depart' => $heure_depart,
    'prix' => $prix,
    'places_disponibles' => $places,
    'description' => $description
];

if ($trajet->save($data, $db)) {
    echo json_encode(['success' => true, 'message' => 'Trajet publié avec succès']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement']);
}
exit;

<?php
header('Content-Type: application/json');

$link = mysqli_connect("localhost", "root", "", "allocovoit");
if (!$link) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données.']);
    exit;
}

// Vérification que tous les champs sont remplis
$required = ['nom', 'prenom', 'email', 'telephone', 'mot_passe'];
foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
        exit;
    }
}

$nom = trim($_POST['nom']);
$prenom = trim($_POST['prenom']);
$email = trim($_POST['email']);
$telephone = trim($_POST['telephone']);
$mot_de_passe = $_POST['mot_passe'];
$confirme_mot_passe = $_POST['confirme_mot_passe'];

// Vérification que les champs « Mot de passe » et « Confirmer le mot de passe » correspondent
if ($confirme_mot_passe != $mot_de_passe) {
        echo json_encode(['success' => false, 'message' => 'les mots de passe doivent être identiques. Vérifiez-les et réessayez.']);
        exit;
    }

// Vérification que le champ email est valide
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse email invalide.']);
    exit;
}

$stmt = mysqli_prepare($link, "SELECT id_utilisateur FROM utilisateur WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

// Vérification que l'email existe
if (mysqli_stmt_num_rows($stmt) > 0) {
    mysqli_stmt_close($stmt);
    mysqli_close($link);
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé.']);
    exit;
}
mysqli_stmt_close($stmt);

// Hacher le mot de passe avant stockage
$mot_de_passe_hash = password_hash($mot_de_passe, PASSWORD_DEFAULT);
$stmt = mysqli_prepare($link, "INSERT INTO utilisateur (nom, prenom, email, telephone, mot_de_passe) VALUES (?, ?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, "sssss", $nom, $prenom, $email, $telephone, $mot_de_passe_hash);

if (mysqli_stmt_execute($stmt)) {
    mysqli_close($link);
    echo json_encode(['success' => true]);
} else {
    mysqli_close($link);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'inscription. Veuillez réessayer.']);
}
?>
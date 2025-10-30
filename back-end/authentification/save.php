<?php
// Connexion à la base de données
$link = mysqli_connect("localhost", "root", "", "allocovoit");
// Vérifier la connexion
if (!$link) {
    die("Erreur de connexion : " . mysqli_connect_error());
}
// Récupération des données du formulaire
$nom = $_POST['nom'];
$prenom = $_POST['prenom'];
$email = $_POST['email'];
$telephone = $_POST['telephone'];
$mot_de_passe = password_hash($_POST['mot_passe'], PASSWORD_DEFAULT); 
$type_compte = $_POST['type_compte'];

// Insertion dans la base de données
$sql = "INSERT INTO utilisateur (nom, prenom, email, telephone, mot_de_passe, type_compte)
VALUES ('$nom', '$prenom', '$email', '$telephone', '$mot_de_passe', '$type_compte')";
if (mysqli_query($link, $sql)) {
    header("Location: ../../front-end/interfaces/main.html");
} else {
    echo "Erreur : " . mysqli_error($link);
}
// Fermer la connexion
mysqli_close($link);
?>
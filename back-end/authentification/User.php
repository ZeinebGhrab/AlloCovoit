<?php
require_once '../config/Database.php';

class User {
    private $db; // instance de Database

    // Attributs utilisateur
    private $id;
    private $nom;
    private $prenom;
    private $email;
    private $role;

    public function __construct($database) {
        $this->db = $database;
    }

    public function login($email, $mot_de_passe) {
        $conn = $this->db->connect();

        $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($mot_de_passe, $user['mot_de_passe'])) {
            session_start();
            $_SESSION['connecte'] = true;
            $_SESSION['user_id'] = $user['id_utilisateur'];
            $_SESSION['nom'] = $user['nom'];
            $_SESSION['prenom'] = $user['prenom'];
            $_SESSION['role'] = $user['type_compte'] ?? 'utilisateur';

            // Remplir les attributs de l'objet
            $this->id = $user['id_utilisateur'];
            $this->nom = $user['nom'];
            $this->prenom = $user['prenom'];
            $this->email = $user['email'];
            $this->role = $_SESSION['role'];

           return true;
        } 
         return false;
    }

    // Getters
    public function getId() {
        return $this->id;
    }

    public function getNom() {
        return $this->nom;
    }

    public function getPrenom() {
        return $this->prenom;
    }

    public function getEmail() {
        return $this->email;
    }
}
?>


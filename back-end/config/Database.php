<?php
class Database {
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $dbname = "allocovoit";
    private $conn = null;

    public function connect() {
        // Si déjà connecté, retourner la connexion existante
        if ($this->conn && $this->conn->ping()) {
            return $this->conn;
        }

        $this->conn = new mysqli($this->host, $this->user, $this->password, $this->dbname);

        if ($this->conn->connect_error) {
            die(json_encode(['error' => 'Erreur de connexion : ' . $this->conn->connect_error]));
        }

        // ⭐ AJOUTEZ CES LIGNES ICI
        if (!$this->conn->set_charset("utf8mb4")) {
            die(json_encode(['error' => 'Erreur set_charset : ' . $this->conn->error]));
        }

        return $this->conn;
    }

    public function close() {
        // Fermer uniquement si la connexion existe et n'est pas déjà fermée
        if ($this->conn instanceof mysqli && $this->conn->ping()) {
            $this->conn->close();
            $this->conn = null;
        }
    }
}
?>
?>

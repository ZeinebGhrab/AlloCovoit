<?php
require_once __DIR__ . '/../../config/Database.php';

class UserManager {
    private Database $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
    }

    // Compter tous les utilisateurs
    public function countAllUsers(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM utilisateur");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return (int)$result['total'];
    }

    // Tous les utilisateurs avec pagination
    public function getAllUsers(int $page = 1, int $limit = 10) {
        try {
            $offset = ($page - 1) * $limit;

            // Récupérer le nombre total d'utilisateurs
            $countStmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM utilisateur");
            $countStmt->execute();
            $countResult = $countStmt->get_result()->fetch_assoc();
            $totalUsers = $countResult['total'];
            $countStmt->close();

            // Récupérer les utilisateurs pour la page courante
            $sql = "SELECT * FROM utilisateur ORDER BY nom ASC, prenom ASC LIMIT ? OFFSET ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('ii', $limit, $offset);
            $stmt->execute();
            $result = $stmt->get_result();

            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            $stmt->close();

            return [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalUsers,
                'totalPages' => ceil($totalUsers / $limit),
                'users' => $users
            ];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Bloquer un utilisateur
    public function blockUser(int $id) {
        try {
            $stmt = $this->conn->prepare("UPDATE utilisateur SET statut = 'inactif' WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();
            return $res;
        } catch (Exception $e) {
            return false;
        }
    }

    // Débloquer un utilisateur
    public function unblockUser(int $id) {
        try {
            $stmt = $this->conn->prepare("UPDATE utilisateur SET statut = 'actif' WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();
            return $res;
        } catch (Exception $e) {
            return false;
        }
    }

    // Supprimer un utilisateur
    public function delete(int $id) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
            $stmt->bind_param('i', $id);
            $res = $stmt->execute();
            $stmt->close();
            return $res;
        } catch (Exception $e) {
            return false;
        }
    }

    // Fermer la connexion
    public function close(): void {
        $this->db->close();
    }
}
?>

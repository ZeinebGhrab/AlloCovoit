<?php
require_once '../../config/Database.php';
require_once 'Trajet.php';

class TrajetManager {
    private Database $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
    }

    // Tous les trajets filtrés
    public function getAll($filters = []) {
        $sql = "SELECT t.*, u.nom AS conducteur_nom, u.prenom AS conducteur_prenom
                FROM trajet t
                JOIN utilisateur u ON t.id_conducteur = u.id_utilisateur
                WHERE t.statut = 'actif' AND t.places_disponibles > 0";

        $params = [];
        $types = '';

        if (!empty($filters['depart'])) {
            $sql .= " AND t.ville_depart LIKE ?";
            $params[] = '%' . $filters['depart'] . '%';
            $types .= 's';
        }
        if (!empty($filters['arrivee'])) {
            $sql .= " AND t.ville_arrivee LIKE ?";
            $params[] = '%' . $filters['arrivee'] . '%';
            $types .= 's';
        }
        if (!empty($filters['date'])) {
            $sql .= " AND t.date_depart = ?";
            $params[] = $filters['date'];
            $types .= 's';
        }

        $sql .= " ORDER BY t.date_depart ASC, t.heure_depart ASC";

        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $trajets = [];
        while ($row = $result->fetch_assoc()) {
            $trajets[] = $row;
        }

        $stmt->close();
        return $trajets; 
    }

    // Mes trajets pour un conducteur
    public function getMyRoutes($userId) {
        $sql = "SELECT * FROM trajet WHERE id_conducteur = ? ORDER BY date_depart DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $trajets = [];
        while ($row = $result->fetch_assoc()) {
            $trajets[] = $row;
        }

        $stmt->close();
        return $trajets;
    }

    // Annuler un trajet
    public function cancel(int $id) {
        $stmt = $this->conn->prepare("UPDATE trajet SET statut = 'annulé' WHERE id_trajet = ?");
        $stmt->bind_param('i', $id);
        $res = $stmt->execute();
        $stmt->close();
        return $res;
    }

    // Supprimer un trajet (seul le conducteur peut supprimer)
    public function delete(int $id, int $userId) {
        $stmt = $this->conn->prepare("DELETE FROM trajet WHERE id_trajet = ? AND id_conducteur = ?");
        $stmt->bind_param('ii', $id, $userId);
        $res = $stmt->execute();
        $stmt->close();
        return $res;
    }

    // Fermer la connexion
    public function close(): void {
        $this->db->close();
    }
}
?>

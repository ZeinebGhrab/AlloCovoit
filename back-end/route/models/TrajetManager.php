<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require_once '../../config/Database.php';
require_once 'Trajet.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../../phpmailer/src/Exception.php';
require_once '../../phpmailer/src/PHPMailer.php';
require_once '../../phpmailer/src/SMTP.php';

require_once '../../../vendor/autoload.php'; 

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../..'); 
$dotenv->load();


class TrajetManager {
    private Database $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
    }

    // Compter tous les trajets
    public function countAllTrajets(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM trajet");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return (int)$result['total'];
    }

    // Compter tous les trajets validés
    public function countValidate($userId,$filters = []): int {
        $sql = "SELECT COUNT(*) AS total
            FROM trajet AS t
            JOIN utilisateur AS u ON t.id_conducteur = u.id_utilisateur
            WHERE t.valider = 1
              AND t.places_reservees != t.places_disponibles
              AND u.statut = 'actif'
              AND t.id_conducteur != ?
              AND TIMESTAMP(t.date_depart, t.heure_depart) > SYSDATE()";

        $params = [$userId];
        $types = 'i';

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

        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) $stmt->bind_param($types, ...$params);

        $stmt->execute();
        $total = $stmt->get_result()->fetch_assoc()['total'] ?? 0;
        $stmt->close();

        return (int)$total;
    }

    // Tous les trajets validés avec filtres et pagination
    public function getAllValidate($userId, $filters = [], $sortField = 'date_depart', $sortOrder = 'ASC', $offset = 0, $limit = 10) {
        $allowedSortFields = ['date_depart','heure_depart','ville_depart','ville_arrivee','nom','prenom'];
        $sortField = in_array($sortField, $allowedSortFields) ? $sortField : 'date_depart';
        $sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

        $sql = "SELECT t.*, u.nom AS conducteur_nom, u.prenom AS conducteur_prenom
            FROM trajet AS t 
            JOIN utilisateur AS u ON t.id_conducteur = u.id_utilisateur
            WHERE t.valider = 1 
              AND t.places_reservees != t.places_disponibles 
              AND u.statut = 'actif'
              AND t.id_conducteur != ?
              AND TIMESTAMP(t.date_depart, t.heure_depart) > SYSDATE()";

        $params = [$userId];
        $types = 'i';

        // Filtres dynamiques
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

        $sql .= " ORDER BY $sortField $sortOrder LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';

        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) $stmt->bind_param($types, ...$params);

        $stmt->execute();
        $result = $stmt->get_result();

        $trajets = [];
        while ($row = $result->fetch_assoc()) {
            $trajets[] = $row;
        }
        $stmt->close();
        return $trajets;
    }

    // Tous les trajets (pour admin) avec filtres et pagination
    public function getAll(int $page = 1, int $limit = 10): array {
        $offset = ($page - 1) * $limit;

        // Compter le total de trajets
        $sqlCount = "SELECT COUNT(*) as total FROM trajet";
        $stmtCount = $this->conn->prepare($sqlCount);
        $stmtCount->execute();
        $resultCount = $stmtCount->get_result();
        $total = $resultCount->fetch_assoc()['total'];
        $stmtCount->close();

        // Calculer le nombre total de pages
        $totalPages = ceil($total / $limit);

        // Récupérer les trajets de la page courante
        $sql = "SELECT t.*, u.nom AS conducteur_nom, u.prenom AS conducteur_prenom, u.email AS conducteur_email, u.telephone AS conducteur_telephone,
            (SELECT COUNT(*) FROM reservation r WHERE r.id_trajet = t.id_trajet) as places_reservees
            FROM trajet t
            JOIN utilisateur u ON t.id_conducteur = u.id_utilisateur
            ORDER BY t.date_depart DESC, t.heure_depart DESC
            LIMIT " . intval($limit) . " OFFSET " . intval($offset);

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Erreur préparation SQL: " . $this->conn->error);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $trajets = [];
        while ($row = $result->fetch_assoc()) {
            $trajets[] = $row;
        }

        $stmt->close();

        // Retourner les données avec la pagination
        return [
            'trajets' => $trajets,
            'totalPages' => $totalPages,
            'page' => $page,
            'total' => $total
        ];
    }

    // Mes trajets pour un conducteur
    public function getMyRoutes(int $userId, ?string $statut = null, int $page = 1, int $limit = 10): array {
        $offset = ($page - 1) * $limit;

        $sql = "SELECT t.*, u.nom AS conducteur_nom, u.prenom AS conducteur_prenom
            FROM trajet t
            JOIN utilisateur u ON t.id_conducteur = u.id_utilisateur
            WHERE t.id_conducteur = ?";


        $params = [$userId];
        $types = "i";

        if ($statut !== null && $statut !== 'tous') {
            $sql .= " AND t.statut = ?";
            $params[] = $statut;
            $types .= "s";
        }

        $sql .= " ORDER BY t.date_depart DESC, t.heure_depart DESC
            LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Erreur préparation SQL: " . $this->conn->error);
        }

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $trajets = [];
        while ($row = $result->fetch_assoc()) {
            $trajets[] = $row;
        }

        $stmt->close();
        return $trajets;
    }

    // Compter mes trajets
    public function countMyRoutes(int $userId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) AS total FROM trajet WHERE id_conducteur = ?");
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return (int)($result['total'] ?? 0);
    }

    // Valider un trajet
    public function validateRoute(int $id) {
        $stmt = $this->conn->prepare("UPDATE trajet SET valider = 1 WHERE id_trajet = ?");
        $stmt->bind_param('i', $id);
        $res = $stmt->execute();
        $stmt->close();
         if ($res) {
            // Récupérer l'email du conducteur concerné
            $sql = "SELECT u.email, u.nom, u.prenom, t.date_depart, t.heure_depart 
                    FROM trajet t 
                    JOIN utilisateur u ON t.id_conducteur = u.id_utilisateur 
                    WHERE t.id_trajet = ?";
                    
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if ($result) {
                // Envoyer l'email
                $this->sendValidationEmail($result['email'], $result['nom'], $result['prenom'], $result['date_depart'], $result['heure_depart']);
            }
        }

        return $res;
    }

    // Refuser un trajet
    public function refuseRoute(int $id) {
        $stmt = $this->conn->prepare("UPDATE trajet SET valider = 0 WHERE id_trajet = ?");
        $stmt->bind_param('i', $id);
        $affectedRows = $stmt->execute();
        $stmt->close();
        if ($affectedRows > 0) {
            return true; // Trajet trouvé et mis à jour
        } else {
            return false; // Trajet inexistant ou déjà refusé
        }
    }

    // Annuler un trajet (conducteur)
    public function cancel(int $id) {
        $stmt = $this->conn->prepare("UPDATE trajet SET statut = 'annulé' WHERE id_trajet = ?");
        $stmt->bind_param('i', $id);
        $res = $stmt->execute();
        $stmt->close();
        return $res;
    }

    // Supprimer un trajet
    public function delete(int $id, int $userId, bool $isAdmin = false) {
        if ($isAdmin) {
            $stmt = $this->conn->prepare("DELETE FROM trajet WHERE id_trajet = ?");
            $stmt->bind_param('i', $id);
        } else {
            $stmt = $this->conn->prepare("DELETE FROM trajet WHERE id_trajet = ? AND id_conducteur = ?");
            $stmt->bind_param('ii', $id, $userId);
        }

        $res = $stmt->execute();
        $stmt->close();
        return $res;
    }

    // Fermer la connexion
    public function close(): void {
        $this->db->close();
    }

    // Méthode pour envoyer l'email
    private function sendValidationEmail($to, $nom, $prenom, $date, $heure) {
        $mail = new PHPMailer(true);
        try {
            // Serveur SMTP
            $mail->isSMTP();
            $mail->Host = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USERNAME'];
            $mail->Password = $_ENV['MAIL_PASSWORD']; 
            $mail->SMTPSecure =  $_ENV['MAIL_ENCRYPTION'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = $_ENV['MAIL_PORT'];
            
            // Encodage correct
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            // Expéditeur et destinataire
            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to, "$prenom $nom");

            // Contenu du mail
            $mail->isHTML(true);
            $mail->Subject = 'Votre trajet a été validé ✅';
            $mail->Body = "
                Bonjour <b>$prenom $nom</b>,<br><br>
                Votre trajet prévu le <b>$date</b> à <b>$heure</b> a été validé avec succès.<br>
                Merci pour votre confiance.<br><br>
                <i>Équipe Covoiturage AlloCovoit</i>
            ";

            $mail->send();
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email : {$mail->ErrorInfo}");
        }
    }

    // Retourne le revenu total de tous les trajets validés
    public function getTotalRevenue() {
        $sql = "SELECT SUM(prix * places_reservees) AS total_revenue 
            FROM trajet 
            WHERE valider = 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return (float)($result['total_revenue'] ?? 0);
    }
}
?>

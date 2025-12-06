<?php
require_once '../../config/Database.php';
require_once 'Reservation.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../phpmailer/src/Exception.php';
require_once __DIR__ . '/../../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/src/SMTP.php';

require_once __DIR__ . '/../../../vendor/autoload.php'; // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../..');
$dotenv->load();

class ReservationManager {
    private mysqli $conn;

    public function __construct(mysqli $conn) {
        $this->conn = $conn;
    }

    // Compter tous les réservations
    public function countAllReservations(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) AS total_reservations FROM reservation");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return (int)$result['total_reservations'];
    }


    // Tous les réservations (pour admin) avec filtres et pagination
    public function getAllReservations(int $page = 1, int $limit = 5, string $search = ''): array {
        $offset = ($page - 1) * $limit;

        // Construire filtre 
        $filterSql = "";
        $params = [];
        $types = "";

        if (!empty($search)) {
            $filterSql = "
                WHERE 
                    u.nom LIKE ? 
                    OR u.prenom LIKE ?
                    OR t.ville_depart LIKE ?
                    OR t.ville_arrivee LIKE ?
            ";

            $searchTerm = "%$search%";

            $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm];
            $types = "ssss";
        }

        // Compter le total filtré 
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM reservation r
            JOIN trajet t ON r.id_trajet = t.id_trajet
            JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
            $filterSql
        ";

        $countStmt = $this->conn->prepare($countQuery);

        if (!empty($search)) {
            $countStmt->bind_param($types, ...$params);
        }

        $countStmt->execute();
        $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        // Pagination calculée
        $totalPages = ceil($total / $limit);

        // Récupérer les réservations filtrées 
        $query = "
            SELECT 
                r.*, 
                t.ville_depart, t.ville_arrivee, t.date_depart, t.heure_depart, t.prix,
                u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, 
                u.email AS email_utilisateur, u.telephone AS telephone_utilisateur
            FROM reservation r
            JOIN trajet t ON r.id_trajet = t.id_trajet
            JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
            $filterSql
            ORDER BY r.date_reservation DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $this->conn->prepare($query);

        // Ajouter LIMIT & OFFSET
        if (!empty($search)) {
            $types .= "ii";
            $params[] = $limit;
            $params[] = $offset;
            $stmt->bind_param($types, ...$params);
        } else {
            $stmt->bind_param("ii", $limit, $offset);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $reservations = [];
        while ($row = $result->fetch_assoc()) {
            $reservations[] = $row;
        }

        $stmt->close();

        return [
            'reservations' => $reservations,
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => $totalPages,
            'search' => $search
        ];
    }

    // Obtenir toutes les réservations d’un utilisateur
    public function getUserReservations(int $userId, int $page = 1, int $limit = 10, string $status = 'tous'): array {
        $query = "
            SELECT 
            r.id_reservation,
            r.id_trajet,
            r.nombre_places,
            r.statut AS reservation_statut,
            r.date_reservation,
            t.ville_depart,
            t.ville_arrivee,
            t.date_depart,
            t.heure_depart,
            t.prix,
            t.statut AS trajet_statut
        FROM reservation r
        JOIN trajet t ON r.id_trajet = t.id_trajet
        WHERE r.id_utilisateur = ?
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

         // Filtrer par statut si nécessaire
        if ($status !== 'tous') {
            $query .= " AND r.statut = ? ";
        }

        // Ajout pagination
        $query .= " ORDER BY r.date_reservation DESC LIMIT ? OFFSET ?";

        // Préparer la requête selon filtre
        if ($status !== 'tous') {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("isii", $userId, $status, $limit, $offset);
        } else {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("iii", $userId, $limit, $offset);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $reservations = [];
        while ($row = $result->fetch_assoc()) {
            $reservations[] = [
                'id_reservation' => $row['id_reservation'],
                'id_trajet' => $row['id_trajet'],
                'ville_depart' => $row['ville_depart'],
                'ville_arrivee' => $row['ville_arrivee'],
                'date_depart' => $row['date_depart'],
                'heure_depart' => $row['heure_depart'],
                'prix' => $row['prix'],
                'nombre_places' => $row['nombre_places'],
                'statut_reservation' => $row['reservation_statut'],
                'statut_trajet' => $row['trajet_statut'],
                'date_reservation' => $row['date_reservation']
            ];
        }
        $stmt->close();

        // Récupérer le total pour la pagination
        $countQuery = "SELECT COUNT(*) AS total FROM reservation r WHERE r.id_utilisateur = ?";
        if ($status !== 'tous') {
            $countQuery .= " AND r.statut = ? ";
            $stmt2 = $this->conn->prepare($countQuery);
            $stmt2->bind_param("is", $userId, $status);
        } else {
            $stmt2 = $this->conn->prepare($countQuery);
            $stmt2->bind_param("i", $userId);
        }

        $stmt2->execute();
        $total = $stmt2->get_result()->fetch_assoc()['total'];
        $stmt2->close();

        return [
            'items' => $reservations,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ];
    }

    // Obtenir seulement le nombre total de réservations d’un utilisateur

    public function getUserReservationCount(int $userId): int {
        $query = "
            SELECT COUNT(*) AS total_Reservations
            FROM reservation
            WHERE id_utilisateur = ?
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        $stmt->close();
        return $row['total_Reservations'] ?? 0;
    }

    //  Obtenir les demandes reçues par le conducteur
    public function getReceivedRequests(int $driverId, int $page, int $limit, string $status = 'tous'): array {
        $query = "
            SELECT 
            r.id_reservation,
            r.id_trajet,
            r.nombre_places,
            r.statut AS reservation_statut,
            r.date_reservation,
            u.nom AS nom_passager,
            u.prenom AS prenom_passager,
            u.email AS email_passager,
            t.ville_depart,
            t.ville_arrivee,
            t.date_depart,
            t.heure_depart,
            t.prix
        FROM reservation r
        JOIN trajet t ON r.id_trajet = t.id_trajet
        JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
        WHERE t.id_conducteur = ?
        ";

        // Filter by reservation status
        if ($status !== 'tous') {
            $query .= " AND r.statut = ? ";
        }

        // Order + pagination
        $query .= " ORDER BY r.date_reservation DESC LIMIT ? OFFSET ?";

        if ($status !== 'tous') {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("isii", $driverId, $status, $limit, $offset);
        } else {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("iii", $driverId, $limit, $offset);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id_reservation' => $row['id_reservation'],
                'id_trajet' => $row['id_trajet'],
                'nom_passager' => $row['prenom_passager'] . ' ' . $row['nom_passager'],
                'email_passager' => $row['email_passager'],
                'ville_depart' => $row['ville_depart'],
                'ville_arrivee' => $row['ville_arrivee'],
                'date_depart' => $row['date_depart'],
                'heure_depart' => $row['heure_depart'],
                'prix' => $row['prix'],
                'nombre_places' => $row['nombre_places'],
                'statut_reservation' => $row['reservation_statut'],
                'date_reservation' => $row['date_reservation'],
            ];
        }

        $stmt->close();
        
        // Count total rows (for pagination)
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM reservation r
            JOIN trajet t ON r.id_trajet = t.id_trajet
            WHERE t.id_conducteur = ?
        ";

        if ($status !== 'tous') {
            $countQuery .= " AND r.statut = ? ";
            $stmt2 = $this->conn->prepare($countQuery);
            $stmt2->bind_param("is", $driverId, $status);
        } else {
            $stmt2 = $this->conn->prepare($countQuery);
            $stmt2->bind_param("i", $driverId);
        }

        $stmt2->execute();
        $total = $stmt2->get_result()->fetch_assoc()['total'];
        $stmt2->close();

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ];
    }

    // Obtenir seulement le nombre total de demande de réservations d’un utilisateur
    public function getReceivedRequestsCount(int $driverId): int {
        $query = "
            SELECT COUNT(*) AS total_Request_Reservations
            FROM reservation r
            JOIN trajet t ON r.id_trajet = t.id_trajet
            WHERE t.id_conducteur = ?
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $driverId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        $stmt->close();
        return $row['total_Request_Reservations'] ?? 0;
    }

    // Ajouter une réservation et notifier le conducteur
    public function addReservation(int $userId, int $routeId, int $seatCount = 1, string $message = ''): array {

        // Vérifier les places disponibles avant insertion
        $stmt = $this->conn->prepare("
            SELECT t.places_disponibles, t.places_reservees, t.ville_depart, t.ville_arrivee, t.date_depart
            FROM trajet t
            WHERE id_trajet = ? 
            FOR UPDATE
        ");
        $stmt->bind_param('i', $routeId);
        $stmt->execute();
        $trajet = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$trajet) {
            return [
                'success' => false,
                'message' => "Trajet introuvable (ID $routeId)"
            ];
        }

        $placesRestantes = (int)$trajet['places_disponibles'] - (int)$trajet['places_reservees'];
        if ($seatCount > $placesRestantes) {
            return [
                'success' => false,
                'message' => "Impossible de réserver $seatCount place(s) pour le trajet {$trajet['ville_depart']} → {$trajet['ville_arrivee']} le {$trajet['date_depart']} : seulement $placesRestantes disponible(s)"
            ];
        }

        // Insérer la réservation
        $stmt = $this->conn->prepare("
            INSERT INTO reservation (id_utilisateur, id_trajet, nombre_places, message, statut)
            VALUES (?, ?, ?, ?, 'en_attente')
        ");
        $stmt->bind_param('iiis', $userId, $routeId, $seatCount, $message);
        $res = $stmt->execute();
        $stmt->close();

        if (!$res) {
            return [
                'success' => false,
                'message' => "Erreur lors de la création de la réservation pour le trajet $routeId"
            ];
        }

        // Récupérer le conducteur du trajet
        $stmt = $this->conn->prepare("
            SELECT u.email, u.prenom, u.nom 
            FROM trajet t 
            JOIN utilisateur u ON t.id_conducteur = u.id_utilisateur 
            WHERE t.id_trajet = ?
        ");
        $stmt->bind_param('i', $routeId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($result) {
            $subject = "Nouvelle réservation en attente 🚗";
            $body = "Bonjour {$result['prenom']} {$result['nom']},<br><br>
                    Une nouvelle réservation a été effectuée pour votre trajet (ID: $routeId).<br>
                    Nombre de places réservées : $seatCount.<br>
                    Veuillez vérifier votre tableau de bord pour confirmer ou gérer cette réservation.<br><br>
                    Merci,<br>
                    <i>L'équipe AlloCovoit</i>";

            $this->sendUserEmail(
                $result['email'],
                $result['prenom'],
                $result['nom'],
                $subject,
                $body
            );
        }

        return [
            'success' => true,
            'message' => "Réservation ajoutée avec succès pour le trajet $routeId"
        ];
    }


    // Confirmer une réservation et mettre à jour les places
     
    public function confirmReservation(int $reservationId): bool {
        // Récupérer la réservation et l'utilisateur
        $stmt = $this->conn->prepare("
            SELECT r.id_trajet, r.nombre_places, u.email, u.prenom, u.nom, t.places_disponibles, t.places_reservees
            FROM reservation r
            JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
            JOIN trajet t ON r.id_trajet = t.id_trajet
            WHERE r.id_reservation = ?
        ");
        $stmt->bind_param('i', $reservationId);
        $stmt->execute();
        $res = $stmt->get_result();
        $reservation = $res->fetch_assoc();
        $stmt->close();

        if (!$reservation) return false;

        $trajetId = (int)$reservation['id_trajet'];
        $places = (int)$reservation['nombre_places'];
        $placesDisponibles = (int)$reservation['places_disponibles'] - (int)$reservation['places_reservees'];

         // Vérifier si suffisamment de places disponibles
        if ($places > $placesDisponibles) {
            error_log("Erreur: nombre de places demandées ($places) supérieur aux places disponibles ($placesDisponibles) pour le trajet $trajetId");
            return false; 
        }

        // Mettre à jour le statut de la réservation
        $stmt = $this->conn->prepare("UPDATE reservation SET statut = 'confirmé' WHERE id_reservation = ?");
        $stmt->bind_param('i', $reservationId);
        $res1 = $stmt->execute();
        $stmt->close();
        if (!$res1) return false;

        // Mettre à jour les places réservées dans trajet
        $stmt = $this->conn->prepare("
            UPDATE trajet 
            SET places_reservees = places_reservees + ? 
            WHERE id_trajet = ? AND places_reservees + ? <= places_disponibles
        ");
        $stmt->bind_param('iii', $places, $trajetId, $places);
        $res2 = $stmt->execute();
        $stmt->close();

        if (!$res2) return false;

        // Vérifier si le trajet est complet, le marquer comme terminé
        $stmt = $this->conn->prepare("
            UPDATE trajet 
            SET statut = 'terminé' 
            WHERE id_trajet = ? AND places_reservees = places_disponibles
        ");
        $stmt->bind_param('i', $trajetId);
        $stmt->execute();
        $stmt->close();

        // Envoyer email au passager
        $subject = "Votre réservation est confirmée ✅";
        $body = "Bonjour {$reservation['prenom']} {$reservation['nom']},<br><br>
             Votre réservation pour le trajet (ID: $trajetId) a été confirmée.<br>
             Nombre de places : $places.<br><br>
             Merci d'utiliser AlloCovoit !<br>
             <i>L'équipe AlloCovoit</i>";

        $this->sendUserEmail($reservation['email'], $reservation['prenom'], $reservation['nom'], $subject, $body);

         return $res2;
    }


    // Annuler une réservation
     
    public function cancelReservation(int $reservationId): bool {
        // Récupérer la réservation et l'utilisateur
        $stmt = $this->conn->prepare("
            SELECT r.id_trajet, r.nombre_places, u.email, u.prenom, u.nom
            FROM reservation r
            JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
            WHERE r.id_reservation = ?
        ");
        $stmt->bind_param('i', $reservationId);
        $stmt->execute();
        $res = $stmt->get_result();
        $reservation = $res->fetch_assoc();
        $stmt->close();

        if (!$reservation) return false;

        $trajetId = (int)$reservation['id_trajet'];
        $places = (int)$reservation['nombre_places'];

        // Mettre à jour le statut de la réservation
        $stmt = $this->conn->prepare("UPDATE reservation SET statut = 'annulé' WHERE id_reservation = ?");
        $stmt->bind_param('i', $reservationId);
        $resUpdate = $stmt->execute();
        $stmt->close();

        if (!$resUpdate) return false;

        // Libérer les places dans le trajet
        if ($reservation['statut_reservation'] === 'confirmé') {
            $stmt = $this->conn->prepare("UPDATE trajet SET places_reservees = places_reservees - ? WHERE id_trajet = ?");
            $stmt->bind_param('ii', $places, $trajetId);
            $stmt->execute();
            $stmt->close();
        }


        // Envoyer email au passager
        $subject = "Votre réservation a été annulée ❌";
        $body = "Bonjour {$reservation['prenom']} {$reservation['nom']},<br><br>
             Votre réservation pour le trajet (ID: $trajetId) a été annulée.<br>
             Nombre de places : $places.<br><br>
             Merci d'utiliser AlloCovoit !<br>
             <i>L'équipe AlloCovoit</i>";

        $this->sendUserEmail($reservation['email'], $reservation['prenom'], $reservation['nom'], $subject, $body);

        return true;
    }

    // Supprimer une réservation
    public function deleteReservation(int $reservationId): bool {

        // Récupérer la réservation avant suppression
        $stmt = $this->conn->prepare("
            SELECT r.id_trajet, r.nombre_places, r.statut AS statut_reservation,
               u.email, u.prenom, u.nom
            FROM reservation r
            JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
            WHERE r.id_reservation = ?
        ");
        $stmt->bind_param("i", $reservationId);
        $stmt->execute();
        $res = $stmt->get_result();
        $reservation = $res->fetch_assoc();
        $stmt->close();

        if (!$reservation) {
            return false; // Rien à supprimer
        }

        $trajetId = (int)$reservation['id_trajet'];
        $places = (int)$reservation['nombre_places'];
        $statutReservation = $reservation['statut_reservation'];

        // Si la réservation était confirmée , libérer les places
        if ($statutReservation === 'confirmé') {
            $stmt = $this->conn->prepare("
                UPDATE trajet 
                    SET places_reservees = GREATEST(places_reservees - ?, 0)
                WHERE id_trajet = ?
            ");
            $stmt->bind_param("ii", $places, $trajetId);
            $stmt->execute();
            $stmt->close();
        }

        // Supprimer la réservation
        $stmt = $this->conn->prepare("DELETE FROM reservation WHERE id_reservation = ?");
        $stmt->bind_param("i", $reservationId);
        $deleted = $stmt->execute();
        $stmt->close();

        if (!$deleted) return false;

        // Envoi email au passager
        $subject = "Suppression de votre réservation ❌";
        $body = "Bonjour {$reservation['prenom']} {$reservation['nom']},<br><br>
            Votre réservation pour le trajet (ID: $trajetId) a été supprimée définitivement.<br>
            Places concernées : $places.<br><br>
            Merci d'utiliser AlloCovoit.<br>
            <i>L'équipe AlloCovoit</i>";

        $this->sendUserEmail(
            $reservation['email'],
            $reservation['prenom'],
            $reservation['nom'],
            $subject,
            $body
        );
        return true;
    }

    // Fermer la connexion
   
    public function close(): void {
        $this->conn->close();
    }
    
    // Envoyer un email via PHPMailer
    
    private function sendUserEmail(string $to, string $prenom, string $nom, string $subject, string $body): void {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USERNAME'];
            $mail->Password   = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = ($_ENV['MAIL_ENCRYPTION'] === 'tls') 
                ? PHPMailer::ENCRYPTION_STARTTLS 
                : PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = $_ENV['MAIL_PORT'];

            $mail->CharSet   = 'UTF-8';
            $mail->Encoding  = 'base64';
            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to, "$prenom $nom");

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email à $to : {$mail->ErrorInfo}");
        }
    }
}
?>

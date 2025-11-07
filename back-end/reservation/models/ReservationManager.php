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

    // Obtenir toutes les réservations d’un utilisateur
    public function getUserReservations(int $userId): array {
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
            ORDER BY r.date_reservation DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
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
        return $reservations;
    }

    //  Obtenir les demandes reçues par le conducteur
    public function getReceivedRequests(int $driverId): array {
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
            ORDER BY r.date_reservation DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $driverId);
        $stmt->execute();
        $result = $stmt->get_result();

        $demandes = [];
        while ($row = $result->fetch_assoc()) {
            $demandes[] = [
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
                'date_reservation' => $row['date_reservation']
            ];
        }

        $stmt->close();
        return $demandes;
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

<?php
class Reservation {
    private int $id_reservation;
    private int $id_utilisateur;
    private int $id_trajet;
    private int $nombre_places;
    private string $statut;
    private string $message;
    private string $date_reservation;

    public function __construct(array $data) {
        $this->id_reservation = $data['id_reservation'] ?? 0;
        $this->id_utilisateur = $data['id_utilisateur'] ?? 0;
        $this->id_trajet = $data['id_trajet'] ?? 0;
        $this->nombre_places = $data['nombre_places'] ?? 1;
        $this->statut = $data['statut'] ?? 'en_attente';
        $this->message = $data['message'] ?? '';
        $this->date_reservation = $data['date_reservation'] ?? date('Y-m-d H:i:s');
    }

    public function toArray(): array {
        return [
            'id_reservation' => $this->id_reservation,
            'id_utilisateur' => $this->id_utilisateur,
            'id_trajet' => $this->id_trajet,
            'nombre_places' => $this->nombre_places,
            'statut' => $this->statut,
            'date_reservation' => $this->date_reservation,
            'message' => $this->message
        ];
    }
}
?>

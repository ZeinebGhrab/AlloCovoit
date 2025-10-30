<?php
class Trajet {
    private int $id;
    private int $id_conducteur;
    private string $ville_depart;
    private string $ville_arrivee;
    private string $date_depart;
    private string $heure_depart;
    private float $prix;
    private int $places_disponibles;
    private string $description;
    private string $statut;
    private string $conducteur_nom;
    private string $conducteur_prenom;

    public function __construct(array $data) {
        $this->id = $data['id_trajet'] ?? 0;
        $this->id_conducteur = $data['id_conducteur'] ?? 0;
        $this->ville_depart = $data['ville_depart'] ?? '';
        $this->ville_arrivee = $data['ville_arrivee'] ?? '';
        $this->date_depart = $data['date_depart'] ?? '';
        $this->heure_depart = $data['heure_depart'] ?? '';
        $this->prix = $data['prix'] ?? 0.0;
        $this->places_disponibles = $data['places_disponibles'] ?? 0;
        $this->description = $data['description'] ?? '';
        $this->statut = $data['statut'] ?? 'actif';
        $this->conducteur_nom = $data['conducteur_nom'] ?? '';
        $this->conducteur_prenom = $data['conducteur_prenom'] ?? '';
    }

    //  Méthode pour enregistrer le trajet en base 
public function save(array $data, $db): bool {
    $stmt = $db->prepare("
        INSERT INTO trajet (id_conducteur, ville_depart, ville_arrivee, date_depart, heure_depart, prix, places_disponibles, description, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        error_log("Erreur prepare mysqli: " . $db->error);
        return false;
    }

    $statut = 'actif';
    $stmt->bind_param(
        "issssdiss",
        $data['id_conducteur'],
        $data['ville_depart'],
        $data['ville_arrivee'],
        $data['date_depart'],
        $data['heure_depart'],
        $data['prix'],
        $data['places_disponibles'],
        $data['description'],
        $statut
    );

    return $stmt->execute();
}


    // Getters
    public function getId(): int { return $this->id; }
    public function getDepart(): string { return $this->ville_depart; }
    public function getArrivee(): string { return $this->ville_arrivee; }
    public function getDate(): string { return $this->date_depart; }
    public function getHeure(): string { return $this->heure_depart; }
    public function getPrix(): float { return $this->prix; }
    public function getPlaces(): int { return $this->places_disponibles; }
    public function getDescription(): string { return $this->description; }
    public function getStatut(): string { return $this->statut; }
    public function getConducteur(): string { return $this->conducteur_nom . ' ' . $this->conducteur_prenom; }

    // Modifier statut
    public function annuler(): void {
        $this->statut = 'annulé';
    }
}
?>

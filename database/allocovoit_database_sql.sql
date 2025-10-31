-- ============================================
-- Base de données AlloCovoit
-- ============================================

CREATE DATABASE IF NOT EXISTS allocovoit CHARACTER SET utf8mb4 COLLATE utf8_unicode_ci;
USE allocovoit;

-- ============================================
-- Table utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    type_compte ENUM('utilisateur', 'admin') DEFAULT 'utilisateur',
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    INDEX idx_email (email),
    INDEX idx_type_compte (type_compte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table trajet
-- ============================================
CREATE TABLE IF NOT EXISTS trajet (
    id_trajet INT AUTO_INCREMENT PRIMARY KEY,
    id_conducteur INT NOT NULL,
    ville_depart VARCHAR(100) NOT NULL,
    ville_arrivee VARCHAR(100) NOT NULL,
    date_depart DATE NOT NULL,
    heure_depart TIME NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    places_disponibles INT NOT NULL,
    description TEXT,
    statut ENUM('actif', 'complet', 'annulé', 'terminé') DEFAULT 'actif',
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conducteur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_conducteur (id_conducteur),
    INDEX idx_depart_arrivee (ville_depart, ville_arrivee),
    INDEX idx_date (date_depart),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table reservation
-- ============================================
CREATE TABLE IF NOT EXISTS reservation (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    id_trajet INT NOT NULL,
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'confirmé', 'annulé', 'terminé') DEFAULT 'en_attente',
    nombre_places INT DEFAULT 1,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_trajet) REFERENCES trajet(id_trajet) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation (id_utilisateur, id_trajet),
    INDEX idx_utilisateur (id_utilisateur),
    INDEX idx_trajet (id_trajet),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table avis
-- ============================================
CREATE TABLE IF NOT EXISTS avis (
    id_avis INT AUTO_INCREMENT PRIMARY KEY,
    id_auteur INT NOT NULL,
    id_destinataire INT NOT NULL,
    id_trajet INT NOT NULL,
    note INT CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT,
    date_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_auteur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_destinataire) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_trajet) REFERENCES trajet(id_trajet) ON DELETE CASCADE,
    INDEX idx_destinataire (id_destinataire),
    INDEX idx_trajet (id_trajet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table message (système de messagerie)
-- ============================================
CREATE TABLE IF NOT EXISTS message (
    id_message INT AUTO_INCREMENT PRIMARY KEY,
    id_expediteur INT NOT NULL,
    id_destinataire INT NOT NULL,
    contenu TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_expediteur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_destinataire) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_expediteur (id_expediteur),
    INDEX idx_destinataire (id_destinataire),
    INDEX idx_lu (lu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Données de test
-- ============================================

-- Utilisateurs de test
INSERT INTO utilisateur (nom, prenom, email, telephone, mot_de_passe, type_compte) VALUES
('Ghrab', 'Zeineb', 'zeineb.ghrab@enetcom.u-sfax.tn', '+216 12 345 678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Ghrab', 'Zeineb', 'zeinebghrab8@email.com', '+216 23 456 789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'utilisateur'),
('Trabelsi', 'Eya', 'eya.trabelsi@email.com', '+216 34 567 890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'utilisateur'),
('Jlassi', 'Mohamed', 'mohamed.jlassi@email.com', '+216 45 678 901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'utilisateur');

-- Trajets de test
INSERT INTO trajet (id_conducteur, ville_depart, ville_arrivee, date_depart, heure_depart, prix, places_disponibles, description, statut) VALUES
(2, 'Sfax', 'Sousse', '2025-11-15', '08:00:00', 25.00, 3, 'Trajet direct, voiture confortable', 'actif'),
(3, 'Hammamet', 'Tunis', '2025-11-15', '09:00:00', 25.00, 1, 'Trajet direct, voiture confortable', 'actif'),
(2, 'Mahdia', 'Gabes', '2025-11-19', '08:12:00', 60.00, 2, 'Voiture confort', 'actif'),
(4, 'Klibia', 'Tunis', '2025-11-19', '08:12:00', 30.00, 2, 'Voiture confort', 'actif'),
(3, 'Sousse', 'Sfax', '2025-11-20', '14:30:00', 20.00, 3, 'Retour après le travail', 'actif'),
(2, 'Tunis', 'Monastir', '2025-11-22', '10:00:00', 35.00, 2, 'Climatisation, musique', 'actif');

-- Réservations de test
INSERT INTO reservation (id_utilisateur, id_trajet, statut, nombre_places) VALUES
(1, 1, 'confirmé', 1),
(4, 2, 'confirmé', 1),
(1, 3, 'en_attente', 1);

-- Mot de passe par défaut pour tous les comptes de test : "password123"
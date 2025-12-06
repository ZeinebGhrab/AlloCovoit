export function showUserDetails(user) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-user-circle"></i> Détails de l'utilisateur</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label><i class="fas fa-user"></i> Nom complet</label>
                        <span>${user.nom} ${user.prenom}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <span>${user.email}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar-plus"></i> Date d'inscription</label>
                        <span>${user.date_inscription || 'Non disponible'}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-check-circle"></i> Statut</label>
                        <span class="badge ${user.statut === 'actif' ? 'badge-success' : 'badge-danger'}">
                            ${user.statut}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-shield-alt"></i> Rôle</label>
                        <span>${user.role || 'Utilisateur'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

export function showTrajetDetails(trajet) {
    const modal = createModal();
    const isValidated = Number(trajet.valider) === 1;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-route"></i> Détails du trajet</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label><i class="fas fa-map-marker-alt"></i> Ville de départ</label>
                        <span>${trajet.ville_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-map-marker-alt"></i> Ville d'arrivée</label>
                        <span>${trajet.ville_arrivee}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar"></i> Date de départ</label>
                        <span>${trajet.date_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-clock"></i> Heure de départ</label>
                        <span>${trajet.heure_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-euro-sign"></i> Prix</label>
                        <span>${trajet.prix} DT</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-users"></i> Places disponibles</label>
                        <span>${trajet.places_disponibles}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-chair"></i> Places réservées</label>
                        <span>${trajet.places_reservees || 0}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-user"></i> Conducteur</label>
                        <span>${trajet.conducteur_nom || ''} ${trajet.conducteur_prenom || ''}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-check-circle"></i> Statut</label>
                        <span class="badge ${isValidated ? 'badge-success' : 'badge-warning'}">
                            ${isValidated ? 'Validé' : 'En attente'}
                        </span>
                    </div>
                    <div class="detail-item full-width">
                        <label><i class="fas fa-info-circle"></i> Description</label>
                        <span>${trajet.description || 'Aucune description'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

export function showReservationDetails(reservation) {
    const modal = createModal();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-ticket-alt"></i> Détails de la réservation</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label><i class="fas fa-user"></i> Utilisateur</label>
                        <span>${reservation.nom_utilisateur} ${reservation.prenom_utilisateur}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <span>${reservation.email_utilisateur || 'Non disponible'}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-map-marker-alt"></i> Départ</label>
                        <span>${reservation.ville_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-map-marker-alt"></i> Arrivée</label>
                        <span>${reservation.ville_arrivee}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar"></i> Date du trajet</label>
                        <span>${reservation.date_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-clock"></i> Heure du trajet</label>
                        <span>${reservation.heure_depart}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar-check"></i> Date de réservation</label>
                        <span>${reservation.date_reservation}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-users"></i> Nombre de places</label>
                        <span>${reservation.nombre_places}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-euro-sign"></i> Prix total</label>
                        <span>${(reservation.prix * reservation.nombre_places).toFixed(2)} DT</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-check-circle"></i> Statut</label>
                        <span class="badge ${getStatusBadge(reservation.statut)}">
                            ${reservation.statut}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-user-tie"></i> Conducteur</label>
                        <span>${reservation.nom_utilisateur} ${reservation.prenom_utilisateur}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

function getStatusBadge(statut) {
    const statusMap = {
        'confirmée': 'badge-success',
        'en attente': 'badge-warning',
        'annulée': 'badge-danger',
        'refusée': 'badge-danger'
    };
    return statusMap[statut?.toLowerCase()] || 'badge-primary';
}

// Styles CSS pour les modals de détails
export function injectModalStyles() {
    if (document.getElementById('modal-details-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-details-styles';
    style.textContent = `
        .modal-content {
            position: relative;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid var(--border);
        }

        .modal-header h2 {
            font-size: 1.75rem;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 0;
        }

        .modal-header h2 i {
            color: var(--primary);
            font-size: 2rem;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--gray);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0.5rem;
            border-radius: 8px;
        }

        .modal-close:hover {
            background: var(--light);
            color: var(--danger);
            transform: rotate(90deg);
        }

        .modal-body {
            margin-bottom: 2rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .detail-item {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, rgba(249, 115, 22, 0.03) 100%);
            padding: 1.25rem;
            border-radius: 12px;
            border: 2px solid var(--border);
            transition: all 0.3s ease;
        }

        .detail-item:hover {
            border-color: var(--primary);
            box-shadow: 0 4px 15px var(--shadow);
            transform: translateY(-2px);
        }

        .detail-item.full-width {
            grid-column: 1 / -1;
        }

        .detail-item label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
        }

        .detail-item label i {
            color: var(--primary);
            font-size: 1.1rem;
        }

        .detail-item span {
            color: var(--gray);
            font-size: 1rem;
            font-weight: 500;
            display: block;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 2px solid var(--border);
        }

        @media (max-width: 768px) {
            .modal-content {
                max-width: 95%;
                padding: 2rem;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .modal-header h2 {
                font-size: 1.5rem;
            }

            .detail-item {
                padding: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialiser les styles au chargement
injectModalStyles();
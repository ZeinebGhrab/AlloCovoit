import { createModal, getStatusBadge } from './modal_utils.js';

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
                        <label><i class="fas fa-phone"></i> Téléphone</label>
                        <span>${reservation.telephone_utilisateur || 'Non disponible'}</span>
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
                        <label><i class="fas fa-euro-sign"></i> Prix unitaire</label>
                        <span>${reservation.prix || reservation.prix_unitaire || 0} DT</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calculator"></i> Prix total</label>
                        <span>${((reservation.prix || reservation.prix_unitaire || 0) * reservation.nombre_places).toFixed(2)} DT</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-check-circle"></i> Statut</label>
                        <span class="badge ${getStatusBadge(reservation.statut)}">
                            ${reservation.statut}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-user-tie"></i> Conducteur</label>
                        <span>${reservation.nom_utilisateur || ''} ${reservation.prenom_utilisateur || ''}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-phone"></i> Contact conducteur</label>
                        <span>${reservation.telephone_utilisateur || 'Non disponible'}</span>
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
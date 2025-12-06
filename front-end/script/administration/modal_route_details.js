import { createModal } from './modal_utils.js';

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
                        <label><i class="fas fa-phone"></i> Contact conducteur</label>
                        <span>${trajet.conducteur_telephone || 'Non disponible'}</span>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <span>${trajet.conducteur_email}</span>
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
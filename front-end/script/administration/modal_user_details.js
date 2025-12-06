import { createModal } from './modal_utils.js';

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
                        <label><i class="fas fa-phone"></i> Téléphone</label>
                        <span>${user.telephone || 'Non renseigné'}</span>
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
                        <span>${user.type_compte || 'Utilisateur'}</span>
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
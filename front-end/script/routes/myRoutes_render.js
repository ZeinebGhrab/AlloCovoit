import { openModal } from './myRoutes_section.js';
import { allTrajets } from './routes_api.js';

let currentFilter = 'tous';

export function displayMesTrajets(containerId = 'mesTrajets') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const trajetsToDisplay = currentFilter === 'tous' ? allTrajets : allTrajets.filter(t => t.statut === currentFilter);

    if (trajetsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car" style="text-align:center;font-size: 80px;opacity: 0.3;"></i>
                <h3 style="text-align:center;">Aucun trajet</h3>
                <p style="text-align:center;color:#666;">Vous n’avez publié aucun trajet pour le moment.</p>
            </div>`;
        return;
    }

    trajetsToDisplay.forEach(t => {
        const div = document.createElement('div');
        const prix = t.prix + ' DT';
        div.className = 'trajet-card';
        div.innerHTML = `
        <h3><i class="fas fa-route"></i>${t.ville_depart} → ${t.ville_arrivee}</h3>
        <div class="trajet-info">
            <span><i class="fas fa-calendar"></i><strong>Date:</strong> ${t.date_depart}</span>
            <span><i class="fas fa-clock"></i><strong>Heure:</strong> ${t.heure_depart}</span>
            <span><i class="fas fa-users"></i><strong>Places:</strong> ${t.places_disponibles}</span>
            <span><i class="fas fa-euro-sign"></i><strong>Prix:</strong> ${prix}</span>
            <span><i class="fas fa-users"></i><strong>Statut:</strong>${t.statut}</span>
        </div>
         
        `;

        if (t.statut === 'actif') {
            const btnCancel = document.createElement('button');
            btnCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Annuler ce trajet';
            btnCancel.className = `btn-action refuse-btn`;
            btnCancel.addEventListener('click', () => openModal(t.id_trajet, 'cancel'));
            div.appendChild(btnCancel);
        }

        const btnDelete = document.createElement('button');
        btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i> Supprimer ce trajet';
        btnDelete.className = `delete-btn btn-action`;
        btnDelete.addEventListener('click', () => openModal(t.id_trajet, 'delete'));
        div.appendChild(btnDelete);

        container.appendChild(div);
    });
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
}

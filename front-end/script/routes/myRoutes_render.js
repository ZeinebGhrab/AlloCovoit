import { openModal } from './myRoutes_section.js';
import { allTrajets } from './routes_api.js';

let currentFilter = 'tous';

export function displayMesTrajets(containerId = 'mesTrajets') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const trajetsToDisplay = currentFilter === 'tous' ? allTrajets : allTrajets.filter(t => t.statut === currentFilter);

    if (trajetsToDisplay.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;">Aucun trajet trouvé</p>';
        return;
    }

    trajetsToDisplay.forEach(t => {
        const div = document.createElement('div');
        div.className = 'trajet-card';
        div.innerHTML = `
            <h3>${t.ville_depart} → ${t.ville_arrivee}</h3>
            <p>Date: ${t.date_depart}</p>
            <p>Heure: ${t.heure_depart}</p>
            <p>Prix: ${t.prix} DT</p>
            <p>Places: ${t.places_disponibles}</p>
            <p>Statut: ${t.statut}</p>
        `;

        if (t.statut === 'actif') {
            const btnCancel = document.createElement('button');
            btnCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Annuler ce trajet';
            btnCancel.style.cssText = `background: orange;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none;`;
            btnCancel.addEventListener('click', () => openModal(t.id_trajet, 'cancel'));
            div.appendChild(btnCancel);
        }

        const btnDelete = document.createElement('button');
        btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i> Supprimer ce trajet';
        btnDelete.style.cssText = `background: #dc3545;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none; margin-left:5px`;
        btnDelete.addEventListener('click', () => openModal(t.id_trajet, 'delete'));
        div.appendChild(btnDelete);

        container.appendChild(div);
    });
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
}

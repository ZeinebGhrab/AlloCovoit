import { handleTrajetAction } from "./routes_actions.js";
import { addToCart } from '../cart.js';

export function renderTrajetsAdmin(trajets, container) {

    container.innerHTML = `
        <table class="table-container">
            <thead>
                <tr>
                    <th>Départ</th>
                    <th>Arrivée</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Conducteur</th>
                    <th>Prix</th>
                    <th>Places</th>
                    <th>Réservées</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                 ${trajets.map(t => {
                    const isValidated = Number(t.valider) === 1; // conversion
                    return `
                        <tr>
                            <td>${t.ville_depart}</td>
                            <td>${t.ville_arrivee}</td>
                            <td>${t.date_depart}</td>
                            <td>${t.heure_depart}</td>
                            <td>${t.conducteur_nom || ''} ${t.conducteur_prenom || ''}</td>
                            <td>${t.prix} DT</td>
                            <td>${t.places_disponibles}</td>
                            <td>${t.places_reservees}</td>
                            <td>${isValidated ? 'Validé' : 'En attente'}</td>
                            <td>
                                ${isValidated
                                    ? `<button class="refuse-btn" style="background: orange; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;" data-id="${t.id_trajet}"><i class="fa-solid fa-ban"></i></button>`
                                    : `<button class="validate-btn" style="background: green; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;" data-id="${t.id_trajet}"><i class="fa-solid fa-square-check"></i></button>`
                                }
                                <button class="delete-trajet-btn" style="background: #dc3545;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none; margin-left:5px" data-id="${t.id_trajet}"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div id="trajets-pagination"></div>
    `;

    // Boutons actions
    container.querySelectorAll('.validate-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleTrajetAction("validate", btn.dataset.id)
        )
    );

    container.querySelectorAll('.refuse-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleTrajetAction("refuse", btn.dataset.id)
        )
    );

    container.querySelectorAll('.delete-trajet-btn').forEach(btn =>
        btn.addEventListener("click", () => {
            if (confirm("Supprimer ce trajet ?"))
                handleTrajetAction("delete", btn.dataset.id);
        })
    );
}



export function renderTrajets(trajets) {
    const container = document.getElementById('trajetsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (trajets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Aucun trajet disponible</p>';
        return;
    }

    trajets.forEach(trajet => {
        const card = createTrajetCard(trajet);
        container.appendChild(card);
    });
}

function createTrajetCard(trajet) {
    const div = document.createElement('div');
    div.className = 'trajet-card';

    div.innerHTML = `
        <h3><i class="fas fa-route"></i> ${trajet.ville_depart} → ${trajet.ville_arrivee}</h3>
        <div class="trajet-info">
            <span><i class="fas fa-calendar"></i> <strong>Date:</strong> ${trajet.date_depart}</span>
            <span><i class="fas fa-clock"></i> <strong>Heure:</strong> ${trajet.heure_depart}</span>
            <span><i class="fas fa-euro-sign"></i> <strong>Prix:</strong> ${trajet.prix} DT</span>
            <span><i class="fas fa-users"></i> <strong>Places:</strong> ${trajet.places_disponibles}</span>
            <span><i class="fas fa-user"></i> <strong>Conducteur:</strong> ${trajet.conducteur_nom}</span>
        </div>
        <p>${trajet.description || 'Trajet confortable'}</p>
        <button class="btn-traj">
            <i class="fas fa-cart-plus"></i> Ajouter au panier
        </button>
    `;

    div.querySelector('.btn-traj').addEventListener('click', () => {
        addToCart(
            trajet.id_trajet,
            trajet.ville_depart,
            trajet.ville_arrivee,
            trajet.date_depart,
            trajet.heure_depart,
            trajet.prix
        );
    });

    return div;
}


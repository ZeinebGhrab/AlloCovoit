import { handleTrajetAction } from "./routes_actions.js";
import { addToCart } from '../cart.js';
import { showTrajetDetails } from "../administration/modal_route_details.js";
export function renderTrajetsAdmin(trajets, container) {
    container.innerHTML = `
        <div class="content-header">
            <h2><i class="fas fa-route"></i> Trajets</h2>
        </div>      
        <table class="table-container">
            <thead>
                <tr>
                    <th>Départ</th>
                    <th>Arrivée</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Prix</th>
                    <th>Places</th>
                    <th>Réservées</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${trajets.map(t => {
                    const isValidated = Number(t.valider) === 1;
                    return `
                        <tr>
                            <td>${t.ville_depart}</td>
                            <td>${t.ville_arrivee}</td>
                            <td>${t.date_depart}</td>
                            <td>${t.heure_depart}</td>
                            <td>${t.prix} DT</td>
                            <td>${t.places_disponibles}</td>
                            <td>${t.places_reservees || 0}</td>
                            <td><span class="badge ${isValidated ? 'badge-success' : 'badge-warning'}">${isValidated ? 'Validé' : 'En attente'}</span></td>
                            <td>
                                <button class="view-trajet-btn btn-action" data-id="${t.id_trajet}" title="Voir les détails">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${isValidated
                                    ? `<button class="refuse-btn btn-action" data-id="${t.id_trajet}" title="Refuser">
                                        <i class="fas fa-ban"></i>
                                       </button>`
                                    : `<button class="validate-btn btn-action" data-id="${t.id_trajet}" title="Valider">
                                        <i class="fas fa-check"></i>
                                       </button>`
                                }
                                <button class="delete-trajet-btn btn-action" data-id="${t.id_trajet}" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div id="trajets-pagination"></div>
    `;

    // Bouton Voir détails
    container.querySelectorAll('.view-trajet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const trajet = trajets.find(t => t.id_trajet == btn.dataset.id);
            if (trajet) showTrajetDetails(trajet);
        });
    });

    // Boutons Valider
    container.querySelectorAll('.validate-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleTrajetAction("validate", btn.dataset.id)
        )
    );

    // Boutons Refuser
    container.querySelectorAll('.refuse-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleTrajetAction("refuse", btn.dataset.id)
        )
    );

    // Boutons Supprimer
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
        container.innerHTML = `
            <div class="empty-state" style="text-align:center;">
                <i class="fas fa-car" style="text-align:center;font-size: 80px;opacity: 0.3;"></i>
                <h3 style="text-align:center;">Aucun trajet</h3>
                <p style="text-align:center;color:#666;">Aucun trajet n’a été publié pour le moment.</p>
            </div>`;
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
            <span><i class="fas fa-user"></i> <strong>Conducteur:</strong> ${trajet.conducteur_prenom} ${trajet.conducteur_nom}</span>
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
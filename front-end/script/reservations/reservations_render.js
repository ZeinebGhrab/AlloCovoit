import { showReservationDetails } from "../administration/modal_reservation_details.js";
import { handleReservationsAction } from "./reservations_actions.js";
import { loadReservationsSection } from "./reservations_section.js";

export function renderReservations(reservations, container) {
    container.innerHTML = `
        <div class="content-header">
            <h2><i class="fas fa-ticket-alt"></i> Réservations</h2>
        </div> 
        <div class="search-box">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input 
                    type="text" 
                    id="searchReservationsInput" 
                    placeholder="Rechercher par départ ou arrivée"
                >
            <button class="btn-search">
                <i class="fas fa-search"></i>
                Rechercher
            </button>
        </div>     
        <table class="table-container">
            <thead>
                <tr>
                    <th>Utilisateur</th>
                    <th>Trajet</th>
                    <th>Date réservation</th>
                    <th>Statut</th>
                    <th>Nombre de places</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(r => `
                    <tr>
                        <td>${r.nom_utilisateur} ${r.prenom_utilisateur}</td>
                        <td>${r.ville_depart} → ${r.ville_arrivee}</td>
                        <td>${r.date_reservation}</td>
                        <td><span class="badge ${getStatusBadge(r.statut)}">${r.statut}</span></td>
                        <td>${r.nombre_places}</td>
                        <td>
                            <button class="view-reservation-btn btn-action" data-id="${r.id_reservation}" title="Voir les détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${r.statut == "confirmé"
                                    ? `<button class="refuse-btn btn-action" data-id="${r.id_reservation}" title="Annuler">
                                        <i class="fas fa-ban"></i>
                                       </button>`
                                    : `<button class="validate-btn btn-action" data-id="${r.id_reservation}" title="Confirmer">
                                        <i class="fas fa-check"></i>
                                       </button>`
                            }
                            <button class="delete-btn btn-action" data-id="${r.id_reservation}" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div id="reservations-pagination"></div>
    `;

    // Bouton Voir
    container.querySelectorAll('.view-reservation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reservation = reservations.find(r => r.id_reservation == btn.dataset.id);
            if (reservation) showReservationDetails(reservation);
        });
    });

    // Boutons Valider
    container.querySelectorAll('.validate-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleReservationsAction("validate", btn.dataset.id)
        )
    );

    // Boutons Refuser
    container.querySelectorAll('.refuse-btn').forEach(btn =>
        btn.addEventListener("click", () =>
            handleReservationsAction("refuse", btn.dataset.id)
        )
    );
    
    // Boutons Supprimer
    container.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener("click", () => {
            if (confirm("Supprimer cette réservation ?"))
                handleReservationsAction("delete", btn.dataset.id);
        })
    );

    // Recherche côté API
    const searchInput = container.querySelector('#searchReservationsInput');
    const searchBtn = container.querySelector('.btn-search');
    
    const performSearch = () => {
        const query = searchInput.value.trim();
        loadReservationsSection({ search: query }, 1); // page 1
    };
    
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(); });
    searchBtn.addEventListener('click', performSearch);
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
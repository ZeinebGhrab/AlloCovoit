import { showNotification } from './utils.js';
import { addToCart } from './panier.js';

let currentPage = 1;
let currentFilters = {};
const limit = 10; // trajets par page

// Charger tous les trajets (avec filtres et pagination)
export async function loadTrajets(filters = {}, page = 1, limit = 10) {
    try {
        currentPage = page;
        currentFilters = filters; // garder les filtres pour pagination

        const body = { ...filters, page, limit };

        const response = await fetch("/AlloCovoit/back-end/route/api/get_routes.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!data || !Array.isArray(data.trajets)) {
            showNotification("Erreur lors du chargement des trajets.");
            displayTrajets([]);
            displayPagination(0);
            return;
        }

        displayTrajets(data.trajets);
        displayPagination(data.totalPages);

    } catch (error) {
        showNotification("Erreur de connexion au serveur.");
        displayTrajets([]);
        displayPagination(0);
    }
}

// Afficher les trajets
function displayTrajets(trajets) {
    const container = document.querySelector('.page > div:last-child');
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

// Créer une carte trajet
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

// Afficher la pagination
function displayPagination(totalPages) {
    const container = document.querySelector('.page > div:last-child');
    if (!container) return;

    let pagination = container.querySelector('.pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.className = 'pagination';
        container.appendChild(pagination);
    }
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Bouton précédent
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Précédent';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => loadTrajets(currentFilters, currentPage - 1, limit));
    pagination.appendChild(prevBtn);

    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => loadTrajets(currentFilters, i, limit));
        pagination.appendChild(btn);
    }

    // Bouton suivant
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Suivant';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => loadTrajets(currentFilters, currentPage + 1, limit));
    pagination.appendChild(nextBtn);
}

// Rechercher trajets via filtres HTML
export function searchTrajets() {
    const depart = document.getElementById("searchDepart")?.value.trim() || '';
    const arrivee = document.getElementById("searchArrivee")?.value.trim() || '';
    const date = document.querySelector("input[type='date']")?.value || '';

    loadTrajets({ depart, arrivee, date }, 1, limit); // page 1 à chaque nouvelle recherche
}

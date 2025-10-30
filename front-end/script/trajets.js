import { showNotification } from './utils.js';
import { addToCart } from './panier.js';

const API_BASE_URL = '../../../back-end';

// Charger tous les trajets (optionnel avec filtres)
export async function loadTrajets(filters = {}) {
    try {
        let url = `/Covoiturage/back-end/route/api/get_routes.php`;
        
        // Ajouter les filtres
        const params = new URLSearchParams();
        if (filters.depart) params.append('depart', filters.depart);
        if (filters.arrivee) params.append('arrivee', filters.arrivee);
        if (filters.date) params.append('date', filters.date);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const trajets = await response.json();
        
        displayTrajets(trajets);
    } catch (error) {
        console.error('Erreur lors du chargement des trajets:', error);
        showNotification('Erreur lors du chargement des trajets', 'error');
    }
}

// Afficher mes trajets
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


// Créer une carte pour mes trajets
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

    const btn = div.querySelector('.btn-traj');
    btn.addEventListener('click', () => {
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

// Annuler un trajet
export async function cancelTrajet(id) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce trajet ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/route/api/cancel.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_trajet: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Trajet annulé', 'success');
            loadMyTrajets();
        } else {
            showNotification('Erreur lors de l\'annulation', 'error');
        }
    } catch (error) {
        console.error('Erreur annulation:', error);
        showNotification('Erreur lors de l\'annulation', 'error');
    }
}

// Rechercher trajets via filtres HTML
export function searchTrajets() {
    const depart = document.getElementById('searchDepart')?.value;
    const arrivee = document.getElementById('searchArrivee')?.value;
    const date = document.querySelector('input[type="date"]')?.value;
    
    loadTrajets({ depart, arrivee, date });
}


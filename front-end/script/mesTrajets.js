import { showNotification } from './utils.js';

let allTrajets = [];
let currentFilter = 'tous';
let trajetToCancel = null;

// Filtrer les trajets
function filterTrajets(filter) {
    currentFilter = filter;
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    document.querySelector(`.btn-filter[data-filter="${filter}"]`)?.classList.add('active');
    const filtered = filter === 'tous' ? allTrajets : allTrajets.filter(t => t.statut === filter);
    displayTrajets(filtered);
}

// Afficher mes trajets
function displayTrajets(trajets) {
    const container = document.getElementById('mesTrajets');
    container.innerHTML = '';
    if (trajets.length === 0) return;

    trajets.forEach(t => {
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
            // Bouton Annuler
            const btn_cancel = document.createElement('button');
            btn_cancel.innerHTML = '<i class="fa-solid fa-ban"></i>Annuler ce trajet';
            btn_cancel.style.cssText = `background: orange;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none;`;
            
            btn_cancel.addEventListener('click', () => openModal(t.id_trajet, 'cancel'));
            div.appendChild(btn_cancel);
        }

        // Bouton Supprimer
        const btn_delete = document.createElement('button');
        btn_delete.innerHTML = '<i class="fa-solid fa-trash"></i>Supprimer ce trajet';
        btn_delete.style.cssText = `background: #dc3545;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none; margin-left:5px`;
        btn_delete.addEventListener('click', () => openModal(t.id_trajet, 'delete'));
        div.appendChild(btn_delete);

        container.appendChild(div);
    });
}


// Modale

let currentAction = null; // 'cancel' ou 'delete'

function openModal(id, action) {
    trajetToCancel = id;
    currentAction = action;

    const modal = document.getElementById('cancelModal');
    const title = modal.querySelector('h3');
    const message = modal.querySelector('p');
    const confirmBtn = modal.querySelector('#modalConfirmBtn');

    // Adapter le texte selon l'action
    if (action === 'cancel') {
        title.textContent = "Confirmer l'annulation";
        message.textContent = "Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible.";
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Oui, annuler';
        confirmBtn.style.background = '#dc3545'; 
    } else if (action === 'delete') {
        title.textContent = "Confirmer la suppression";
        message.textContent = "Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est irréversible et le trajet sera définitivement retiré.";
        confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Oui, supprimer';
        confirmBtn.style.background = '#c0392b'; 
    }

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('cancelModal');
    modal.style.display = 'none';
    trajetToCancel = null;
    currentAction = null;
}

// Confirmer annulation
async function confirmCancel() {
    if (!trajetToCancel || !currentAction) {
        return showNotification('Aucun trajet sélectionné', 'error');
    }

    const url = currentAction === 'cancel' 
        ? '/AlloCovoit/back-end/route/api/cancel.php'
        : '/AlloCovoit/back-end/route/api/delete.php'; 

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_trajet: trajetToCancel })
        });
        const data = await res.json();

        if (data.success) {
            showNotification(
                currentAction === 'cancel' ? 'Trajet annulé' : 'Trajet supprimé', 
                'success'
            );
            closeModal();
            loadTrajets(); // Recharger les trajets après action
        } else {
            showNotification(
                currentAction === 'cancel' ? 'Erreur lors de l\'annulation' : 'Erreur lors de la suppression',
                'error'
            );
        }
    } catch (e) {
        showNotification('Erreur lors de l’action', 'error');
        console.error(e);
    }
}


// Statistiques
function updateStats() {
    document.getElementById('totalTrajets').textContent = allTrajets.length;
    document.getElementById('trajetsActifs').textContent = allTrajets.filter(t => t.statut === 'actif').length;
    document.getElementById('totalReservations').textContent = '0'; // À adapter selon API
    document.getElementById('revenuTotal').textContent = '0 DT';   // À adapter selon API
}

// Charger mes trajets avec filtres
async function loadTrajets(filters = {}) {
    const container = document.getElementById('mesTrajets');
    const loading = document.getElementById('loadingIndicator');
    const noMsg = document.getElementById('noTrajetsMessage');
    loading.style.display = 'block';
    container.innerHTML = '';
    noMsg.style.display = 'none';

    try {
        const res = await fetch('/AlloCovoit/back-end/route/api/get_my_routes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        console.log(data.trajets);
        allTrajets = Array.isArray(data.trajets) ? data.trajets : [];
        loading.style.display = 'none';

        if (allTrajets.length === 0) {
            noMsg.style.display = 'block';
        } else {
            updateStats();
            filterTrajets(currentFilter); 
        }
    } catch (e) {
        loading.style.display = 'none';
        showNotification('Erreur lors du chargement des trajets', 'error');
        console.error(e);
    }
}


// Initialisation
export function initMesTrajets() {
    // Gestion des filtres
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => filterTrajets(btn.dataset.filter));
    });

    // Gestion modale
    document.getElementById('modalConfirmBtn')?.addEventListener('click', confirmCancel);
    document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);

    // Charger les trajets
    loadTrajets();
}


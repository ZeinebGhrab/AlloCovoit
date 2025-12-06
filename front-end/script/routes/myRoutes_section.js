import { fetchMyTrajets, performActionOnTrajet } from './routes_api.js';
import { displayMesTrajets, setCurrentFilter } from './myRoutes_render.js';
import { showNotification } from '../utils.js';

let currentAction = null;
let selectedTrajetId = null;
let currentFilter = 'tous'; // filtre courant

// Charger les trajets depuis le back avec filtre
export async function loadMesTrajets(filters = {}) {
    // Ajouter le filtre courant si non fourni
    if (!filters.statut) filters.statut = currentFilter;

    // Récupérer les trajets depuis l'API
    const data = await fetchMyTrajets(filters);
    const trajets = Array.isArray(data.trajets) ? Array.isArray(data.trajets) : [] ;
    // Mettre à jour l'affichage
    displayMesTrajets();

    // Mettre à jour les statistiques
    updateStats(trajets);
    
}

// Initialisation de la page "Mes trajets"
export function initMesTrajets() {
    // Gestion des filtres
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            setCurrentFilter(currentFilter);

            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            loadMesTrajets({ statut: currentFilter }); 
        });
    });

    // Gestion modale
    document.getElementById('modalConfirmBtn')?.addEventListener('click', confirmAction);
    document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);

    // Charger au démarrage
    loadMesTrajets({ statut: currentFilter });
}

// Modale
export function openModal(id_trajet, action) {
    selectedTrajetId = id_trajet;
    currentAction = action;

    const modal = document.getElementById('cancelModal');
    const title = modal.querySelector('h3');
    const message = modal.querySelector('p');
    const confirmBtn = modal.querySelector('#modalConfirmBtn');

    if (action === 'cancel') {
        title.textContent = "Confirmer l'annulation";
        message.textContent = "Êtes-vous sûr de vouloir annuler ce trajet ?";
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Oui, annuler';
    } else {
        title.textContent = "Confirmer la suppression";
        message.textContent = "Êtes-vous sûr de vouloir supprimer ce trajet ?";
        confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Oui, supprimer';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('cancelModal');
    modal.style.display = 'none';
    selectedTrajetId = null;
    currentAction = null;
}

async function confirmAction() {
    if (!selectedTrajetId || !currentAction) return showNotification('Aucun trajet sélectionné', 'error');

    const result = await performActionOnTrajet(selectedTrajetId, currentAction);
    if (result.success) {
        showNotification(currentAction === 'cancel' ? 'Trajet annulé' : 'Trajet supprimé', 'success');
        closeModal();
        loadMesTrajets({ statut: currentFilter });
    } else {
        showNotification('Erreur lors de l’action', 'error');
    }
}

// Statistiques
function updateStats(trajets) {
    document.getElementById('totalTrajets').textContent = trajets.length;
    document.getElementById('trajetsActifs').textContent = trajets.filter(t => t.statut === 'actif').length;
    document.getElementById('totalReservations').textContent = trajets.reduce((acc, t) => acc + (t.reservations || 0), 0);
    document.getElementById('revenuTotal').textContent = trajets.reduce((acc, t) => acc + (t.revenu || 0), 0) + ' DT';
}
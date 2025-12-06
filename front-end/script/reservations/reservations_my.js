import { showNotification, displayPagination } from '../utils.js';
import { getMyReservations, cancelReservation } from './reservations_api.js';

let currentFilters = { filter: 'tous' };
let currentPage = 1;
const limit = 6;

let selectedReservationId = null;
let currentAction = null;

document.addEventListener('DOMContentLoaded', initMyReservations);

export async function initMyReservations() {
    await loadReservations(currentFilters, currentPage, limit);
    setupFilters();
    setupModalEvents();
}

export async function loadReservations(filters = {}, page = 1, limitValue = limit) {
    const container = document.getElementById('mesReservationsListe');
    container.innerHTML = '<p class="loading-text">Chargement...</p>';

    try {
        currentPage = page; // Mettre à jour la page courante

        const data = await getMyReservations(page, limitValue, filters.filter);
        const reservations = data.reservations || [];
        const pagination = data.pagination || {};

        displayReservations(container, reservations);
        displayPagination(
            pagination.totalPages || 1,
            page,
            (pageNumber, limitFromBtn = limitValue, filtersFromBtn = filters) => {
                loadReservations(filtersFromBtn, pageNumber, limitFromBtn);
            },
            filters,
            limitValue,
            'paginationMy'
        );

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="error-text">Échec du chargement des réservations.</p>`;
        showNotification('Erreur lors du chargement des réservations', 'error');
    }
}

function displayReservations(container, reservations) {
    container.innerHTML = '';
    if (!reservations.length) {
        container.innerHTML = `
            <div class="empty-state" style="text-align:center;">
                <i class="fa-solid fa-inbox" style="text-align:center;"></i>
                <h3 style="text-align:center;">Aucune réservation</h3>
                <p style="text-align:center;">Vous n'avez aucune réservation pour le moment.</p>
            </div>`;
        updateStats([]);
        return;
    }

    container.className = 'requests-grid';

    reservations.forEach(r => {
        const card = document.createElement('div');
        card.className = 'reservation-card status-' + r.statut_reservation.toLowerCase().replace(' ', '-');

        const title = document.createElement('h3');
        title.textContent = `${r.ville_depart} → ${r.ville_arrivee}`;
        card.appendChild(title);

        const dateInfo = document.createElement('p');
        dateInfo.className = 'reservation-info';
        dateInfo.textContent = `${r.date_depart} à ${r.heure_depart}`;
        card.appendChild(dateInfo);

        const price = document.createElement('p');
        price.className = 'reservation-info';
        price.textContent = `Prix : ${r.prix} DT`;
        card.appendChild(price);

        const status = document.createElement('span');
        status.className = 'reservation-status';
        status.textContent = r.statut_reservation;
        card.appendChild(status);

        if (r.statut_reservation === 'confirmé') {
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn-cancel';
            btnCancel.textContent = 'Annuler';
            btnCancel.addEventListener('click', () => openModal(r.id_reservation, 'cancel'));
            card.appendChild(btnCancel);
        }

        container.appendChild(card);
    });

    updateStats(reservations);
}

function setupFilters() {
    document.querySelectorAll('.btn-filter-res').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter-res').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.filter = btn.dataset.filter;
            currentPage = 1;
            loadReservations(currentFilters, currentPage, limit);
        });
    });
}

function updateStats(reservations) {
    const counts = { en_attente: 0, confirmé: 0, annulé: 0 };
    reservations.forEach(r => { if (counts[r.statut_reservation] !== undefined) counts[r.statut_reservation]++; });
    document.getElementById('myPendingCount').textContent = counts.en_attente;
    document.getElementById('myConfirmedCount').textContent = counts.confirmé;
    document.getElementById('myRejectedCount').textContent = counts.annulé;
    document.getElementById('totalReservationsCount').textContent = reservations.length;
}

function openModal(id, action) {
    selectedReservationId = id;
    currentAction = action;

    const modal = document.getElementById('cancelModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.querySelector('h3').textContent = action === 'cancel' ? 'Annuler la réservation' : '';
    modal.querySelector('p').textContent = action === 'cancel' ? 'Êtes-vous sûr(e) de vouloir annuler ?' : '';
    modal.querySelector('#modalConfirmBtn').textContent = action === 'cancel' ? 'Annuler' : '';
}

function closeModal() {
    const modal = document.getElementById('cancelModal');
    if (!modal) return;
    modal.style.display = 'none';
    selectedReservationId = null;
    currentAction = null;
}

function setupModalEvents() {
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');

    if (confirmBtn) confirmBtn.addEventListener('click', handleModalAction);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
}

async function handleModalAction() {
    if (!selectedReservationId || !currentAction) return;

    try {
        let result;
        if (currentAction === 'cancel') {
            result = await cancelReservation(selectedReservationId);
        }

        if (result.success) {
            showNotification('Réservation annulée', 'success');
            closeModal();
            await loadReservations(currentFilters, currentPage, limit);
        } else {
            showNotification('Échec de la mise à jour de la réservation', 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('Erreur serveur', 'error');
    }
}

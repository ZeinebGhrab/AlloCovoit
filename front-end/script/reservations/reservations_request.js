import { showNotification, displayPagination } from '../utils.js';
import { getReceivedRequests, confirmReservation, cancelReservation } from './reservations_api.js';

let currentFilters = { filter: 'tous' };
let currentPage = 1;
const limit = 6;

let selectedReservationId = null;
let currentAction = null;

document.addEventListener('DOMContentLoaded', initReceivedRequests);

export async function initReceivedRequests() {
    await loadReceivedRequests(currentFilters, currentPage, limit);
    setupFilters();
    setupModalEvents();
}

export async function loadReceivedRequests(filters = {}, page = 1, limitValue = limit) {
    const container = document.getElementById('demandesRecuesListe');
    container.innerHTML = '<p>Chargement...</p>';

    try {
        // Mettre à jour la page courante 
        currentPage = page;

        const data = await getReceivedRequests(page, limitValue, filters.filter);
        const requests = data.received_requests || [];
        const pagination = data.pagination || {};

        displayRequests(container, requests);
        displayPagination(
            pagination.totalPages || 1,
            page,
            (pageNumber, limitValueFromBtn = limitValue, filtersFromBtn = filters) => {
            loadReceivedRequests(filtersFromBtn, pageNumber, limitValueFromBtn);
            },
            filters,
            limitValue,
            'reservations-pagination'
        );

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: gray;">Échec du chargement des demandes reçues.</p>`;
        showNotification('Erreur lors du chargement des demandes reçues', 'erreur');
    }
}



function displayRequests(container, requests) {
    container.innerHTML = '';

    if (!requests.length) {
        container.innerHTML = `<div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <h3>Aucune demande reçue</h3>
            <p>Vous n'avez reçu aucune réservation pour le moment.</p>
        </div>`;
        updateStats([]);
        return;
    }

    // Utiliser le grid défini dans CSS
    container.className = 'requests-grid';
    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'reservation-card status-' + req.statut_reservation.toLowerCase().replace(' ', '-');

        // Header
        const header = document.createElement('div');
        header.className = 'reservation-header';

        const driverDiv = document.createElement('div');
        driverDiv.className = 'reservation-driver';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = req.nom_passager?.[0].toUpperCase() + req.nom_passager?.split(' ')[1]?.[0].toUpperCase() || 'P';

        const info = document.createElement('div');
        info.className = 'user-info';
        const name = document.createElement('h3');
        name.textContent = req.nom_passager || 'Passager inconnu';
        const route = document.createElement('p');
        route.textContent = `${req.ville_depart} → ${req.ville_arrivee}`;
        info.appendChild(name);
        info.appendChild(route);

        driverDiv.appendChild(avatar);
        driverDiv.appendChild(info);
        header.appendChild(driverDiv);

        // Statut
        const statusDiv = document.createElement('div');
        statusDiv.className = 'demande-status';
        const badge = document.createElement('span');
        badge.className = 'badge-' + req.statut_reservation.toLowerCase().replace(' ', '-');
        badge.textContent = req.statut_reservation;
        statusDiv.appendChild(badge);
        header.appendChild(statusDiv);

        card.appendChild(header);

        // Infos supplémentaires
        const dateInfo = document.createElement('p');
        dateInfo.className = 'demande-time';
        dateInfo.textContent = `${req.date_depart} à ${req.heure_depart}`;
        card.appendChild(dateInfo);

        const places = document.createElement('p');
        places.className = 'demande-time';
        places.textContent = `Places réservées : ${req.nombre_places}`;
        card.appendChild(places);

        const price = document.createElement('p');
        price.className = 'demande-time';
        price.textContent = `Prix : ${req.prix} DT`;
        card.appendChild(price);

        // Boutons pour en attente
        if (req.statut_reservation.toLowerCase() === 'en_attente') {
            const actions = document.createElement('div');
            actions.className = 'demande-actions';

            const btnConfirm = document.createElement('button');
            btnConfirm.className = 'btn-confirm';
            btnConfirm.textContent = 'Confirmer';
            btnConfirm.addEventListener('click', () => openModal(req.id_reservation, 'confirm'));

            const btnReject = document.createElement('button');
            btnReject.className = 'btn-reject';
            btnReject.textContent = 'Annuler';
            btnReject.addEventListener('click', () => openModal(req.id_reservation, 'cancel'));

            actions.appendChild(btnConfirm);
            actions.appendChild(btnReject);
            card.appendChild(actions);
        }

        container.appendChild(card);
    });

    updateStats(requests);
}


function setupFilters() {
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.filter = btn.dataset.filter;
            currentPage = 1;
            loadReceivedRequests(currentFilters, currentPage, limit);
        });
    });
}

function updateStats(requests) {
    const counts = { en_attente: 0, confirmé: 0, annulé: 0 };
    requests.forEach(r => { if (counts[r.statut_reservation] !== undefined) counts[r.statut_reservation]++; });
    document.getElementById('pendingCount').textContent = counts.en_attente;
    document.getElementById('confirmedCount').textContent = counts.confirmé;
    document.getElementById('rejectedCount').textContent = counts.annulé;
    document.getElementById('totalDemandesCount').textContent = requests.length;
}

function openModal(id, action) {
    selectedReservationId = id;
    currentAction = action;

    const modal = document.getElementById('cancelModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.querySelector('h3').textContent = action === 'confirm' ? 'Confirmer la réservation' : 'Annuler la réservation';
    modal.querySelector('p').textContent = action === 'confirm' ? 'Souhaitez-vous confirmer cette réservation ?' : ' Êtes-vous sûr(e) de vouloir annuler?';
    modal.querySelector('#modalConfirmBtn').textContent = action === 'confirm' ? 'Confirmer' : 'Annuler';
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
        if (currentAction === 'confirm') {
            result = await confirmReservation(selectedReservationId);
        } else {
            result = await cancelReservation(selectedReservationId);
        }

        if (result.success) {
            showNotification(
                currentAction === 'confirm' ? 'Reservation confirmed' : 'Reservation canceled',
                'success'
            );
            closeModal();
            // Recharge uniquement la page courante avec les filtres actuels
            await loadReceivedRequests(currentFilters, currentPage, limit);
        } else {
            showNotification('Failed to update reservation', 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('Server error', 'error');
    }
}

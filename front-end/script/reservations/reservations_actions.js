import { fetchReservations, confirmReservation, cancelReservation, deleteReservation } from './reservations_api.js';
import { renderReservations } from './reservations_render.js';
import { displayPagination, showNotification } from '../utils.js';

let currentReservationPage = 1;
const reservationsPerPage = 8;

export async function loadReservationsSection(filters = {}, page = 1, limit = reservationsPerPage) {
    const container = document.getElementById('reservations');
    currentReservationPage = page;

    const data = await fetchReservations(page, limit);
    renderReservations(data.reservations || [], container);

    displayPagination(
        data.totalPages || 1,
        currentReservationPage,
        loadReservationsSection,
        filters,
        limit,
        'reservations-pagination'
    );
}


export async function handleReservationsAction(type, id) {
    let result = null;

    if (type === "validate") {
        result = await confirmReservation(id);
        loadReservationsSection();
    }
    if (type === "refuse") {
        result = await cancelReservation(id);
        loadReservationsSection();
    }
    if (type === "delete") {
        result = await deleteReservation(id);
        loadReservationsSection();
    }

    showNotification(result.message);
}
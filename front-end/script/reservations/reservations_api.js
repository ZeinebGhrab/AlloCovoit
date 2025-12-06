// Charger les réservations
export async function fetchReservations(page = 1, limit = 8) {
    try {
        const response = await fetch('/AlloCovoit/back-end/reservation/api/get_total_reservation.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des réservations.');
        return await response.json();
    } catch (err) {
        console.error(err);
        return { reservations: [], pagination: {} };
    }
}

// Charger les demandes reçues
export async function getReceivedRequests(page = 1, limit = 8, filters = 'tous') {
    const res = await fetch('/AlloCovoit/back-end/reservation/api/get_received_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, limit, filters }) 
    });
    return await res.json();
}


// Charger mes réservations
export async function getMyReservations(page = 1, limit = 8, filters = 'tous') {
    const res = await fetch('/AlloCovoit/back-end/reservation/api/get_user_reservation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, limit, filters }) 
    });
    return res.json();
}

// Confirmer une réservation
export async function confirmReservation(id_reservation) {
    const res = await fetch('/AlloCovoit/back-end/reservation/api/confirm_reservation.php', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reservation })
    });
    return res.json();
}

// Annuler / refuser une réservation
export async function cancelReservation(id_reservation) {
    const res = await fetch('/AlloCovoit/back-end/reservation/api/cancel_reservation.php', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reservation })
    });
    return res.json();
}


// Supprimer une réservation
export async function deleteReservation(id_reservation) {
    const res = await fetch('/AlloCovoit/back-end/reservation/api/delete_reservation.php', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reservation })
    });
    console.log(res);
    return res.json();
}

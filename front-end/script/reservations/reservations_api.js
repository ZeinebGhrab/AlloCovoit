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
        return { reservations: [], totalPages: 0 };
    }
}
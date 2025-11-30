export function renderReservations(reservations, container) {
    container.innerHTML = `
        <div class="content-header">
                    <h2><i class="fas fa-ticket-alt"></i> Réservations</h2>
        </div>
        <table class="table-container">
            <thead>
                <tr>
                    <th>Utilisateur</th>
                    <th>Trajet</th>
                    <th>Date réservation</th>
                    <th>Statut</th>
                    <th>Nombre de places</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(r => `
                    <tr>
                        <td>${r.nom_utilisateur} ${r.prenom_utilisateur}</td>
                        <td>${r.ville_depart} → ${r.ville_arrivee} (${r.date_depart} ${r.heure_depart})</td>
                        <td>${r.date_reservation}</td>
                        <td>${r.statut}</td>
                        <td>${r.nombre_places}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div id="reservations-pagination"></div>
    `;
}
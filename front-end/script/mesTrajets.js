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

// Afficher trajets
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
            const btn = document.createElement('button');
            btn.textContent = 'Annuler ce trajet';
            btn.style.cssText = 'background:red;color:white;padding:5px;border:none;border-radius:4px;margin-top:10px;cursor:pointer;';
            btn.addEventListener('click', () => openModal(t.id_trajet));
            div.appendChild(btn);
        }
        container.appendChild(div);
    });
}

// Modale
function openModal(id) {
    trajetToCancel = id;
    const modal = document.getElementById('cancelModal');
    modal.style.display = 'flex';
}
function closeModal() { 
    document.getElementById('cancelModal').style.display = 'none'; 
    trajetToCancel = null; 
}

// Confirmer annulation
async function confirmCancel() {
    if (!trajetToCancel) return alert('Aucun trajet sélectionné');
    try {
        const res = await fetch('/Covoiturage/back-end/route/api/cancel.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_trajet: trajetToCancel })
        });
        const data = await res.json();
        if (data.success) {
            alert('Trajet annulé');
            closeModal();
            loadTrajets(); // Recharger après annulation
        } else {
            alert('Erreur: ' + (data.error || 'Inconnu'));
        }
    } catch (e) {
        alert('Erreur: ' + e.message);
        console.error(e);
    }
}

// Statistiques
function updateStats() {
    document.getElementById('totalTrajets').textContent = allTrajets.length;
    document.getElementById('trajetsActifs').textContent = allTrajets.filter(t => t.statut === 'actif').length;
    // Si vous avez les données dans `allTrajets`, vous pouvez aussi calculer :
    // - réservations reçues (ex: t.reservations ?)
    // - revenu estimé (ex: t.prix * t.reservations)
    // Pour l'instant, on laisse à 0 si non implémenté.
    document.getElementById('totalReservations').textContent = '0'; // À adapter selon API
    document.getElementById('revenuTotal').textContent = '0 DT';   // À adapter selon API
}

// Charger trajets
async function loadTrajets() {
    const container = document.getElementById('mesTrajets');
    const loading = document.getElementById('loadingIndicator');
    const noMsg = document.getElementById('noTrajetsMessage');
    loading.style.display = 'block';
    container.innerHTML = '';
    noMsg.style.display = 'none';

    try {
        const res = await fetch('/Covoiturage/back-end/route/api/get_my_routes.php');
        const data = await res.json();
        allTrajets = Array.isArray(data) ? data : [];
        loading.style.display = 'none';

        if (allTrajets.length === 0) {
            noMsg.style.display = 'block';
        } else {
            updateStats();
            filterTrajets(currentFilter); 
        }
    } catch (e) {
        loading.style.display = 'none';
        alert('Erreur: ' + e.message);
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


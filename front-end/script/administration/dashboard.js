import { showNotification } from '../utils.js';

export { loadUsersSection, fetchUsers, blockUser, unblockUser, deleteUser };

document.addEventListener('DOMContentLoaded', () => {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.content-section');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sectionId = btn.dataset.section;
            sections.forEach(sec => {
                sec.classList.toggle('active', sec.id === sectionId);
            });

            if (sectionId === 'trajets') {
                loadTrajetsSection();
            }

            if (sectionId === 'users') {
                loadUsersSection();
            }
        });
    });
});


//============================================
//        Gestion des utilisateurs 
//============================================

let currentPage = 1;
const limit = 10; // Nombre d'utilisateurs par page


// Fetch users depuis le backend

async function fetchUsers(page = 1, limit = 10) {
    try {
        const formData = new FormData();
        formData.append('page', page);
        formData.append('limit', limit);

        const response = await fetch('/AlloCovoit/back-end/user/api/user/get_users.php', {
            method: 'POST',
            body: formData
        });
        console.log( response);
        if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs.');

        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
        return { users: [], totalPages: 0, page: 1 };
    }
}


// Affichage des utilisateurs et actions

function displayUsers(users, container) {
    container.innerHTML = `
        <table class="table-container">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr>
                        <td>${u.nom}</td>
                        <td>${u.prenom}</td>
                        <td>${u.email}</td>
                        <td>${u.statut}</td>
                        <td>
                            ${u.statut === 'actif' 
                                ? `<button class="block-btn " style="background: orange; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;" data-id="${u.id_utilisateur}"><i class="fa-solid fa-lock"></i>Bloquer</button>` 
                                : `<button class="unblock-btn" style="background: green; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;"  data-id="${u.id_utilisateur}"><i class="fa-solid fa-unlock"></i>Débloquer</button>`}
                            <button class="delete-btn" style="background: #dc3545;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none; margin-left:5px" data-id="${u.id_utilisateur}"><i class="fa-solid fa-trash"></i>Supprimer</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="pagination-container"></div>
    `;

    // Événements pour les boutons utilisateur
    container.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await blockUser(btn.dataset.id);
            loadUsersSection(currentPage);
        });
    });

    container.querySelectorAll('.unblock-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await unblockUser(btn.dataset.id);
            loadUsersSection(currentPage);
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                await deleteUser(btn.dataset.id);
                loadUsersSection(currentPage);
            }
        });
    });
}


// Gestion API (bloquer, débloquer, supprimer)

async function blockUser(id) {
    await callUserApi('/AlloCovoit/back-end/user/api/user/block_user.php', id);
}

async function unblockUser(id) {
    await callUserApi('/AlloCovoit/back-end/user/api/user/unblock_user.php', id);
}

async function deleteUser(id) {
    await callUserApi('/AlloCovoit/back-end/user/api/user/delete_user.php', id);
}

async function callUserApi(url, id) {
    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();
        showNotification(data.message);
    } catch (err) {
        console.error(err);
        showNotification('Erreur réseau');
    }
}


// Générer pagination

function displayPagination(totalPages, container) {
    const paginationContainer = container.querySelector('.pagination-container');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('pagination-btn');
        if (i === currentPage) btn.classList.add('active');

        btn.addEventListener('click', () => {
            currentPage = i;
            loadUsersSection(currentPage);
        });

        paginationContainer.appendChild(btn);
    }
}


// Load Users Section

async function loadUsersSection(page = 1) {
    const container = document.getElementById('users');
    currentPage = page;

    const data = await fetchUsers(page, limit);
    const users = data.users || [];
    const totalPages = data.totalPages || 1;

    displayUsers(users, container);
    displayPagination(totalPages, container);
}


//============================================
//        Gestion des trajets
//============================================

let currentTrajetPage = 1;
const trajetsPerPage = 10;

// ---- Récupérer les trajets depuis le backend ----
async function fetchTrajets(page = 1, limit = 10) {
    try {
        const formData = new FormData();
        formData.append('page', page);
        formData.append('limit', limit);

        const response = await fetch('/AlloCovoit/back-end/route/api/get_routes_admin.php', {
            method: 'POST',
            body: formData
        });
        console.log(response);

        if (!response.ok) throw new Error('Erreur lors de la récupération des trajets.');

        const data = await response.json();
        console.log('Trajets reçus :', data);
        return data;
    } catch (err) {
        console.error(err);
        return { trajets: [], totalPages: 0, page: 1 };
    }
}

// ---- Affichage des trajets dans le tableau ----
function displayTrajets(trajets, container) {
    container.innerHTML = `
        <table class="table-container">
            <thead>
                <tr>
                    <th>Départ</th>
                    <th>Arrivée</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Conducteur</th>
                    <th>Prix</th>
                    <th>Places Totales</th>
                    <th>Places Réservées</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${trajets.map(t => {
                    const isValidated = Number(t.valider) === 1; // conversion
                    return `
                        <tr>
                            <td>${t.ville_depart}</td>
                            <td>${t.ville_arrivee}</td>
                            <td>${t.date_depart}</td>
                            <td>${t.heure_depart}</td>
                            <td>${t.conducteur_nom || ''} ${t.conducteur_prenom || ''}</td>
                            <td>${t.prix} DT</td>
                            <td>${t.places_disponibles}</td>
                            <td>${t.places_reservees}</td>
                            <td>${isValidated ? 'Validé' : 'En attente'}</td>
                            <td>
                                ${isValidated
                                    ? `<button class="refuse-btn" style="background: orange; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;" data-id="${t.id_trajet}"><i class="fa-solid fa-ban"></i>Refuser</button>`
                                    : `<button class="validate-btn" style="background: green; color: white; padding: 0.875rem 0.875rem; border: none; border-radius: 10px; font-weight: 100; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.3s ease; font-size: 0.9rem; text-decoration: none;" data-id="${t.id_trajet}"><i class="fa-solid fa-square-check"></i>Valider</button>`
                                }
                                <button class="delete-trajet-btn" style="background: #dc3545;color: white;padding: 0.875rem 0.875rem;border: none;border-radius: 10px;font-weight: 100;cursor: pointer;display: inline-flex;align-items: center;gap: 0.5rem;justify-content: center;transition: all 0.3s ease;font-size: 0.9rem;text-decoration: none; margin-left:5px" data-id="${t.id_trajet}"><i class="fa-solid fa-trash"></i>Supprimer</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div class="pagination-container-trajet"></div>
    `;

    // Boutons d’action
    container.querySelectorAll('.validate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await validateTrajet(btn.dataset.id);
            loadTrajetsSection(currentTrajetPage);
        });
    });

    container.querySelectorAll('.refuse-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await refuseTrajet(btn.dataset.id);
            loadTrajetsSection(currentTrajetPage);
        });
    });

    container.querySelectorAll('.delete-trajet-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Supprimer ce trajet ?')) {
                await deleteTrajet(btn.dataset.id);
                loadTrajetsSection(currentTrajetPage);
            }
        });
    });
}

// ---- Appels API ----
async function validateTrajet(id) {
    await callTrajetApi('/AlloCovoit/back-end/route/api/validate_route.php', id);
}

async function refuseTrajet(id) {
    await callTrajetApi('/AlloCovoit/back-end/route/api/refuse_route.php', id);
}

async function deleteTrajet(id) {
    await callTrajetApi('/AlloCovoit/back-end/route/api/delete.php', id);
}

async function callTrajetApi(url, id) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id_trajet: id })
        });

        const data = await response.json();
        showNotification(data.message || data.error);
    } catch (err) {
        console.error(err);
        showNotification('Erreur lors de la communication avec le serveur.');
    }
}

// ---- Pagination ----
function displayTrajetPagination(totalPages, container) {
    const paginationContainer = container.querySelector('.pagination-container-trajet');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('pagination-btn');
        if (i === currentTrajetPage) btn.classList.add('active');

        btn.addEventListener('click', () => {
            currentTrajetPage = i;
            loadTrajetsSection(currentTrajetPage);
        });

        paginationContainer.appendChild(btn);
    }
}

// ---- Chargement de la section trajets ----
async function loadTrajetsSection(page = 1) {
    const container = document.getElementById('trajets');
    currentTrajetPage = page;

    const data = await fetchTrajets(page, trajetsPerPage);
    const trajets = data.trajets || [];
    const totalPages = data.totalPages || 1;

    displayTrajets(trajets, container);
    displayTrajetPagination(totalPages, container);
}

async function loadDashboardStats() {
    const stats = [
        { url: '/AlloCovoit/back-end/route/api/get_total_trajets.php', elementId: 'totalTrajets', fallback: 0 },
        { url: '/AlloCovoit/back-end/user/api/user/get_total_users.php', elementId: 'totalUsers', fallback: 0 }
    ];

    await Promise.all(stats.map(async ({ url, elementId, fallback }) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            const value = Object.values(data)[0]; 
            document.getElementById(elementId).textContent = value ?? fallback;
        } catch (err) {
            console.error(`Erreur chargement stats (${elementId}) :`, err);
            document.getElementById(elementId).textContent = fallback;
        }
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});


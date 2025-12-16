import { blockUser, unblockUser, deleteUser } from "./users_actions.js";
import { showUserDetails } from "../administration/modal_user_details.js";
import { loadUsersSection } from "./users_section.js";

export function displayUsers(users, container, refresh) {
    container.innerHTML = `
        <div class="content-header">
            <h2><i class="fas fa-users"></i> Utilisateurs</h2>
        </div>
        <div class="search-box">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input 
                    type="text" 
                    id="searchUsersInput" 
                    placeholder="Rechercher par nom ou prénom"
                >
            <button class="btn-search">
                <i class="fas fa-search"></i>
                Rechercher
            </button>
        </div>
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
                        <td><span class="badge ${u.statut === 'actif' ? 'badge-success' : 'badge-danger'}">${u.statut}</span></td>
                        <td>
                            <button class="view-btn btn-action" data-id="${u.id_utilisateur}" title="Voir les détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${u.statut === 'actif' 
                                ? `<button class="block-btn btn-action" data-id="${u.id_utilisateur}" title="Bloquer">
                                    <i class="fas fa-lock"></i>
                                   </button>` 
                                : `<button class="unblock-btn btn-action" data-id="${u.id_utilisateur}" title="Débloquer">
                                    <i class="fas fa-unlock"></i>
                                   </button>`}
                            <button class="delete-btn btn-action" data-id="${u.id_utilisateur}" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div id="users-pagination"></div>
    `;

    // Bouton Voir
    container.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const user = users.find(u => u.id_utilisateur == btn.dataset.id);
            if (user) showUserDetails(user);
        });
    });

    // Événements pour les boutons utilisateur
    container.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await blockUser(btn.dataset.id);
            refresh();
        });
    });

    container.querySelectorAll('.unblock-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await unblockUser(btn.dataset.id);
            refresh();
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                await deleteUser(btn.dataset.id);
                refresh();
            }
        });
    });

    // Recherche côté API
    const searchInput = container.querySelector('#searchUsersInput');
    const searchBtn = container.querySelector('.btn-search');
    
    const performSearch = () => {
        const query = searchInput.value.trim();
        loadUsersSection({ search: query }, 1); // page 1
    };
    
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(); });
    searchBtn.addEventListener('click', performSearch);
}
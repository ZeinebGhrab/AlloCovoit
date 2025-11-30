import { blockUser, unblockUser, deleteUser } from "./users_actions.js";

export function displayUsers(users, container, refresh) {
    container.innerHTML = `
        <div class="content-header">
                    <h2><i class="fas fa-users"></i>Utilisateurs</h2>
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
        <div id="users-pagination"></div>
    `;

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
}
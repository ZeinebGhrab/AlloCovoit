import { logout, currentUser } from './authentification/auth.js';
import { searchTrajets } from './trajets.js';
import { confirmReservations } from './panier.js';

export function navigation() {

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            window.location.href = '/AlloCovoit/front-end/interfaces/index.html';
        });
    }
    
    const navButtons = document.querySelectorAll('.nav-buttons button');

    navButtons.forEach(button => {
        const page = button.dataset.page;
        switch(page) {
            case 'all-trajets':
                button.addEventListener('click', () => window.location.href = '/AlloCovoit/front-end/interfaces/route/explore_rides.html');
                break;
            case 'publier-trajet':
                button.addEventListener('click', () => window.location.href = '/AlloCovoit/front-end/interfaces/route/publication.html');
                break;
            case 'panier':
                button.addEventListener('click', () => window.location.href = '/AlloCovoit/front-end/interfaces/route/ride-cart.html');
                break;
            case 'mes-trajets':
                button.addEventListener('click', () => window.location.href = '/AlloCovoit/front-end/interfaces/route/ride-publication.html');
                break;
            case 'demandes':
                button.addEventListener('click', () => window.location.href = '/AlloCovoit/front-end/interfaces/reservation/ride-request.html');
                break;
            case 'deconnexion':
                button.addEventListener('click', logout);
                break;
        }
    });

    //  Bouton Administration si utilisateur = admin
    if (currentUser && currentUser.role === 'admin') {
       
        const navButtonsContainer = document.querySelector('.nav-buttons');
        if (navButtonsContainer && !document.querySelector('button[data-page="admin"]')) {
            const btnAdmin = document.createElement('button');
            btnAdmin.dataset.page = 'admin';
            btnAdmin.innerHTML = `<i class="fas fa-cogs"></i> Administration`;
            btnAdmin.classList.add('btn-admin');
            btnAdmin.addEventListener('click', () => {
                window.location.href = '/AlloCovoit/front-end/interfaces/admin/dashboard.html';
            });

            // Insérer avant "Déconnexion"
            const logoutBtn = navButtonsContainer.querySelector('button[data-page="deconnexion"]');
            navButtonsContainer.insertBefore(btnAdmin, logoutBtn);
        }
    }

    // Gestion du bouton recherche
    const searchBtn = document.querySelector('.filter-section .btn');
    if (searchBtn) searchBtn.addEventListener('click', searchTrajets);

    // Gestion du panier
    const confirmBtn = document.getElementById('confirmPanier');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmReservations);
}

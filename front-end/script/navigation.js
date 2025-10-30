import { logout } from './auth.js';
import { searchTrajets } from './trajets.js';
import { confirmReservations } from './panier.js';

export function navigation() {
    
    const navButtons = document.querySelectorAll('.nav-buttons button');

    navButtons.forEach(button => {
        const page = button.dataset.page;
        switch(page) {
            case 'all-trajets':
                button.addEventListener('click', () => window.location.href = '/Covoiturage/front-end/interfaces/main.html');
                break;
            case 'publier-trajet':
                button.addEventListener('click', () => window.location.href = '/Covoiturage/front-end/interfaces/route/publication.html');
                break;
            case 'panier':
                button.addEventListener('click', () => window.location.href = '/Covoiturage/front-end/interfaces/route/ride-cart.html');
                break;
            case 'mes-trajets':
                button.addEventListener('click', () => window.location.href = '/Covoiturage/front-end/interfaces/route/ride-publication.html');
                break;
            case 'deconnexion':
                button.addEventListener('click', logout);
                break;
        }
    });


    const searchBtn = document.querySelector('.filter-section .btn');
    if (searchBtn) searchBtn.addEventListener('click', searchTrajets);

    const confirmBtn = document.getElementById('confirmPanier');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmReservations);
}

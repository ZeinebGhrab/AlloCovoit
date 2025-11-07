import { checkSession } from './authentification/auth.js';
import { navigation } from './navigation.js';
import { loadTrajets } from './trajets.js';
import { loadCart, updateCartDisplay } from './panier.js';
import { initMesTrajets } from './mesTrajets.js';
import { loadUsersSection } from './administration/dashboard.js';
import { initRideRequests } from './reservation/ride-request.js';

document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    navigation();

    const path = window.location.pathname;

    if (path.includes('main.html')) {
        loadTrajets();
    }
    if (path.includes('ride-cart.html')) {
        loadCart();
        updateCartDisplay();
    }
    if (path.includes('ride-publication.html')) {
        initMesTrajets();
    }

    if (path.includes('dashboard.html')) {
        loadUsersSection();
    }

     if (path.includes('ride-request.html')) {
        initRideRequests();
    }
});
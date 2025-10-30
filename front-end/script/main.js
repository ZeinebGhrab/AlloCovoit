import { checkSession } from './auth.js';
import { navigation } from './navigation.js';
import { loadTrajets } from './trajets.js';
import { loadCart, updateCartDisplay } from './panier.js';
import { initMesTrajets } from './mesTrajets.js';

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
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
});
import { checkSession } from './authentification/auth.js';
import { navigation } from './navigation.js';
import { loadTrajetsSection } from './routes/routes_section.js';
import { searchTrajets } from './routes/routes_search.js';
import { loadCart, updateCartDisplay } from './cart.js';
import { initMesTrajets } from './routes/myRoutes_section.js';
import { loadDashboardStats } from './administration/dashboard_stats.js';
import { initRideRequests } from './reservations/ride-request.js';
import { navigationAdmin } from './administration/dashboard.js';

document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    navigation();

    const path = window.location.pathname;

    if (path.includes('explore_rides.html')) {
        loadTrajetsSection();
        searchTrajets();
    }
    if (path.includes('ride-cart.html')) {
        loadCart();
        updateCartDisplay();
    }
    if (path.includes('ride-publication.html')) {
        initMesTrajets();
    }

    if (path.includes('dashboard.html')) {
        loadDashboardStats();
        navigationAdmin();
    }

     if (path.includes('ride-request.html')) {
        initRideRequests();
    }
});
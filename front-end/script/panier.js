import { showNotification } from './utils.js';

let cart = [];

// Charger le panier depuis la session PHP

export async function loadCart() {
    try {
        const res = await fetch('/AlloCovoit/back-end/route/api/session_routes.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        cart = data.success ? (data.cart || []) : [];
        updateCartDisplay();
    } catch (error) {
        console.error('Erreur lors du chargement du panier :', error);
        showNotification('Erreur lors du chargement du panier', 'error');
    }
}


// Ajouter un trajet au panier

export async function addToCart(id, depart, arrivee, date, heure, prix, nombrePlaces = 1) {
    try {
        const res = await fetch('/AlloCovoit/back-end/route/api/session_routes.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id, depart, arrivee, date, heure, prix, nombre_places: nombrePlaces
            })
        });

        const data = await res.json();
        showNotification(data.message, data.success ? 'success' : 'warning');

        if (data.success) {
            cart = data.cart || [];
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Erreur ajout panier :', error);
        showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}


// Retirer un trajet du panier

export async function removeFromCart(id) {
    try {
        const res = await fetch('/AlloCovoit/back-end/route/api/session_routes.php', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        showNotification(data.message, data.success ? 'success' : 'error');

        if (data.success) await loadCart();
    } catch (error) {
        console.error('Erreur suppression panier :', error);
        showNotification('Erreur lors de la suppression du trajet', 'error');
    }
}


// Afficher le panier à l'écran avec réglage du nombre de places
 
export function updateCartDisplay() {
    const panierList = document.getElementById('panierList');
    const totalElement = document.getElementById('totalPanier');
    if (!panierList) return;

    panierList.innerHTML = '';
    let total = 0;

    // Styles du container
    Object.assign(panierList.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem'
    });

    // Panier vide
    if (cart.length === 0) {
        const emptyState = document.createElement('div');
        Object.assign(emptyState.style, {
            textAlign: 'center',
            padding: '2rem',
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '12px'
        });
        emptyState.innerHTML = '<i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; display: block; margin-bottom: 0.5rem;"></i>Votre panier est vide';
        panierList.appendChild(emptyState);
        if (totalElement) totalElement.textContent = '0';
        return;
    }

    cart.forEach(item => {
        total += parseFloat(item.prix) * (item.nombre_places || 1) || 0;

        const div = document.createElement('div');
        div.className = 'panier-item';
        
        // Styles de la carte
        Object.assign(div.style, {
            background: 'white',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            transition: 'transform 0.2s'
        });

        div.addEventListener('mouseenter', () => div.style.transform = 'translateY(-2px)');
        div.addEventListener('mouseleave', () => div.style.transform = 'translateY(0)');

        // Contenu
        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        const route = document.createElement('div');
        route.innerHTML = `<strong style="font-size: 1.1rem; color: #333;">${item.depart} → ${item.arrivee}</strong>`;
        route.style.marginBottom = '0.5rem';

        const details = document.createElement('div');
        details.innerHTML = `<span style="color: #666; font-size: 0.9rem;">${item.date} à ${item.heure} • ${item.prix} DT</span>`;

        // Sélecteur de places
        const placesDiv = document.createElement('div');
        Object.assign(placesDiv.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem'
        });

        const label = document.createElement('span');
        label.textContent = 'Places:';
        label.style.color = '#666';
        label.style.fontSize = '0.9rem';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.value = item.nombre_places || 1;
        Object.assign(input.style, {
            width: '60px',
            padding: '0.4rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            textAlign: 'center'
        });

        input.addEventListener('change', e => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            item.nombre_places = val;
            updateCartDisplay();
        });

        const subtotal = document.createElement('span');
        subtotal.innerHTML = `<strong style="color: #10b981;">${(parseFloat(item.prix) * (item.nombre_places || 1)).toFixed(2)} DT</strong>`;
        subtotal.style.marginLeft = 'auto';

        placesDiv.append(label, input, subtotal);
        contentDiv.append(route, details, placesDiv);

        // Bouton supprimer
        const btnRemove = document.createElement('button');
        btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
        Object.assign(btnRemove.style, {
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            transition: 'background 0.2s'
        });

        btnRemove.addEventListener('mouseenter', () => btnRemove.style.background = '#dc2626');
        btnRemove.addEventListener('mouseleave', () => btnRemove.style.background = '#ef4444');
        btnRemove.addEventListener('click', () => removeFromCart(item.id));

        div.append(contentDiv, btnRemove);
        panierList.appendChild(div);
    });

    if (totalElement) totalElement.textContent = total.toFixed(2);
}

// Responsive
if (window.innerWidth <= 768) {
    window.addEventListener('load', () => {
        document.querySelectorAll('.panier-item').forEach(item => {
            item.style.flexWrap = 'wrap';
        });
    });
}

// Confirmer les réservations

export async function confirmReservations() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'warning');
        return;
    }

    try {
        const trajetsToConfirm = cart.map(item => ({
            id: item.id,
            nombre_places: item.nombre_places || 1
        }));

        const res = await fetch('/AlloCovoit/back-end/reservation/api/create_reservation.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trajets: trajetsToConfirm })
        });

        let data;
        const text = await res.text();

        try { data = JSON.parse(text); } 
        catch (err) {
            console.error('Réponse non JSON du serveur:', text);
            showNotification('Erreur serveur inattendue', 'error');
            return;
        }

        showNotification(data.message || 'Erreur lors de la confirmation', data.success ? 'success' : 'error');

        if (res.ok && data.success) {
            await fetch('/AlloCovoit/back-end/route/api/session_routes.php', { method: 'PUT', credentials: 'include' });
            cart = [];
            updateCartDisplay();
        }

    } catch (error) {
        console.error('Erreur confirmation fetch:', error);
        showNotification('Impossible de contacter le serveur', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    const confirmButton = document.querySelector('.btn-traj');
    if (confirmButton) confirmButton.addEventListener('click', confirmReservations);
});

export { cart };

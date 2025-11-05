import { showNotification } from './utils.js';

const API_CART_URL = '/AlloCovoit/back-end/route/api/session_routes.php';
let cart = [];

// Charger le panier depuis la session PHP
export async function loadCart() {
    try {
        const res = await fetch(API_CART_URL, {
            method: 'GET',
            credentials: 'include' // pour envoyer le cookie de session PHP
        });
        const data = await res.json();
        if (data.success) {
            cart = data.cart || [];
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Erreur lors du chargement du panier :', error);
    }
}

// Ajouter un trajet au panier (côté PHP)
export async function addToCart(id, depart, arrivee, date, heure, prix) {
    try {
        const res = await fetch(API_CART_URL, {
            method: 'POST',
            credentials: 'include', // pour garder la même session
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, depart, arrivee, date, heure, prix })
        });

        const data = await res.json();
        showNotification(data.message, data.success ? 'success' : 'warning');

        if (data.success) {
            cart = data.cart || [];
            updateCartDisplay();
        }

    } catch (error) {
        console.error('Erreur ajout panier :', error);
    }
}

// Retirer un trajet du panier (côté PHP)
export async function removeFromCart(id) {
    try {
        const res = await fetch(API_CART_URL, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        showNotification(data.message, data.success ? 'success' : 'error');

        if (data.success) loadCart();
    } catch (error) {
        console.error('Erreur suppression panier :', error);
    }
}

// Afficher le panier à l’écran
export function updateCartDisplay() {
    const panierList = document.getElementById('panierList');
    const totalElement = document.getElementById('totalPanier');
    
    if (!panierList) return;

    panierList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        panierList.innerHTML = '<p style="text-align: center; color: #666;">Votre panier est vide</p>';
        if (totalElement) totalElement.textContent = '0';
        return;
    }

    cart.forEach(item => {
        total += parseFloat(item.prix);
        const div = document.createElement('div');
        div.className = 'panier-item';
        div.innerHTML = `
        <div>
            <strong>${item.depart} → ${item.arrivee}</strong><br>
            <span>${item.date} à ${item.heure} - ${item.prix} DT</span>
        </div>
        <button class="btn-secondary">
            <i class="fas fa-trash"></i> Retirer
        </button>
        `;

        div.querySelector("button").addEventListener("click", () => removeFromCart(item.id));
        panierList.appendChild(div);
    });

    if (totalElement) totalElement.textContent = total.toFixed(2);
}

// Confirmer la réservation
export async function confirmReservations() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reservation/create.php`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trajets: cart })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Réservations confirmées !', 'success');

            // vider la session panier côté PHP
            await fetch(API_CART_URL, {
                method: 'PUT',
                credentials: 'include'
            });

            cart = [];
            updateCartDisplay();

            setTimeout(() => {
                window.location.href = './confirmation.html';
            }, 1500);
        } else {
            showNotification('Erreur lors de la confirmation', 'error');
        }
    } catch (error) {
        console.error('Erreur confirmation:', error);
        showNotification('Erreur lors de la confirmation', 'error');
    }
}

export { cart };



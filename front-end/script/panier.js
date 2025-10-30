import { showNotification } from './utils.js';

let cart = [];

// Charger panier depuis localStorage
export function loadCart() {
    const saved = localStorage.getItem('allocovoit_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Sauvegarder panier
export function saveCart() {
    localStorage.setItem('allocovoit_cart', JSON.stringify(cart));
}

// Ajouter au panier
export function addToCart(id, depart, arrivee, date, heure, prix) {
    // Vérifier si déjà dans le panier
    if (cart.some(item => item.id === id)) {
        showNotification('Ce trajet est déjà dans votre panier', 'warning');
        return;
    }
    
    cart.push({ id, depart, arrivee, date, heure, prix });
    saveCart();
    showNotification('Trajet ajouté au panier', 'success');
    updateCartDisplay();
}

// Retirer du panier
export function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    showNotification('Trajet retiré du panier', 'success');
    updateCartDisplay();
}

// Afficher panier
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
    
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}
// Confirmer réservation
export async function confirmReservations() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reservation/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trajets: cart })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Réservations confirmées !', 'success');
            cart = [];
            saveCart();
            
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


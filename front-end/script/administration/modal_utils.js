// Crée un modal de base
 
export function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Fermer avec la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    return modal;
}


// Retourne la classe CSS du badge en fonction du statut

export function getStatusBadge(statut) {
    const statusMap = {
        'confirmée': 'badge-success',
        'en attente': 'badge-warning',
        'annulée': 'badge-danger',
        'refusée': 'badge-danger',
        'validé': 'badge-success',
        'validée': 'badge-success',
        'actif': 'badge-success',
        'inactif': 'badge-danger',
        'bloqué': 'badge-danger'
    };
    return statusMap[statut?.toLowerCase()] || 'badge-primary';
}


// Ferme tous les modals ouverts
 
export function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}


// Formate une date au format français

export function formatDate(dateString) {
    if (!dateString) return 'Non disponible';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}


// Formate une heure au format français

export function formatTime(timeString) {
    if (!timeString) return 'Non disponible';
    
    try {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    } catch {
        return timeString;
    }
}


// Calcule le prix total d'une réservation

export function calculateTotalPrice(prixUnitaire, nombrePlaces) {
    const total = (prixUnitaire || 0) * (nombrePlaces || 0);
    return total.toFixed(2);
}


// Valide un email

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// Valide un numéro de téléphone

export function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 8;
}


// Tronque un texte à une longueur donnée

export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}


// Affiche une notification toast

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// Retourne l'icône pour le toast selon le type

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}


// Copie un texte dans le presse-papiers

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copié dans le presse-papiers', 'success');
    } catch {
        showToast('Erreur lors de la copie', 'error');
    }
}


// Ouvre un lien de téléphone
 
export function callPhone(phone) {
    if (!phone) {
        showToast('Numéro de téléphone non disponible', 'warning');
        return;
    }
    window.location.href = `tel:${phone}`;
}


// Ouvre un lien email

export function sendEmail(email) {
    if (!email || !isValidEmail(email)) {
        showToast('Adresse email non valide', 'warning');
        return;
    }
    window.location.href = `mailto:${email}`;
}
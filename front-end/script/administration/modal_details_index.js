// Export des fonctions d'affichage des modals
export { showUserDetails } from './modal_user_details.js';
export { showTrajetDetails } from './modal_trajet_details.js';
export { showReservationDetails } from './modal_reservation_details.js';

// Export des utilitaires
export {
    createModal,
    getStatusBadge,
    closeAllModals,
    formatDate,
    formatTime,
    calculateTotalPrice,
    isValidEmail,
    isValidPhone,
    truncateText,
    showToast,
    copyToClipboard,
    callPhone,
    sendEmail
} from './modal_utils.js';
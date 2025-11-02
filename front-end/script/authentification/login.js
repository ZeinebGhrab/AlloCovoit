import { showNotification } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner le formulaire de connexion 
    const form = document.querySelector('form[action$="login.php"]');
    const errorMsg = document.getElementById('errorMessage');

    // Si on n'est pas sur la page de login, ne rien faire
    if (!form || !errorMsg) return;

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="mot_passe"]');

        const email = emailInput?.value.trim();
        const password = passwordInput?.value;

        // Validation côté client
        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs.');
            showError('Veuillez remplir tous les champs.');
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Redirection en cas de succès
                window.location.href = '/Covoiturage/front-end/interfaces/main.html';
            } else {
                showNotification('Email ou mot de passe incorrect.');
                showError(result.message || 'Email ou mot de passe incorrect.');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            showNotification('Impossible de contacter le serveur. Veuillez réessayer.');
            showError('Impossible de contacter le serveur. Veuillez réessayer.');
        }
    });

    // Fonction utilitaire pour afficher les erreurs
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';

        // Cacher après 5 secondes
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }

    // Masquer l'erreur dès que l'utilisateur tape
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (errorMsg.style.display === 'block') {
                errorMsg.style.display = 'none';
            }
        });
    });
});
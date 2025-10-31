export let currentUser = null;

// Vérifier session utilisateur
export async function checkSession() {
    try {
        const response = await fetch(`/Covoiturage/back-end/authentification/check_session.php`);
        const data = await response.json();

        if (data.connected) {
            currentUser = data.user;
            updateUserDisplay();
        } else {
            if (!window.location.href.includes('login.html') &&
                !window.location.href.includes('sign.html')) {
                window.location.href = './authentification/login.html';
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
    }
}

// Mettre à jour l’affichage utilisateur dans le nav
export function updateUserDisplay() {
    const userElement = document.querySelector('.nav-buttons span');
    if (userElement && currentUser) {
        userElement.innerHTML = `<i class="fas fa-user"></i> ${currentUser.prenom} ${currentUser.nom}`;
    }
}


// Déconnexion
export function logout() {
    window.location.href = `/Covoiturage/back-end/authentification/disconnect.php`;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMessage');

    if (!form) return; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // Récupérer les données du formulaire
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
               
                window.location.href = '/Covoiturage/front-end/interfaces/main.html';
            } else {
                // Afficher l'erreur dans la page 
                if (errorMsg) {
                    errorMsg.textContent = result.message || 'Une erreur est survenue.';
                    errorMsg.style.display = 'block';
                    // Cacher après 5 secondes
                    setTimeout(() => {
                        errorMsg.style.display = 'none';
                    }, 5000);
                } else {
                    alert(result.message || 'Erreur inconnue');
                }
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            if (errorMsg) {
                errorMsg.textContent = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
                errorMsg.style.display = 'block';
            } else {
                alert('Erreur de connexion au serveur.');
            }
        }
    });
});
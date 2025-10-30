import { showNotification } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const pubForm = document.querySelector('form[action*="route/save.php"]');
    if (!pubForm) return;

    pubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(pubForm);

        const villeDepart = formData.get('Ville_depart');
        const villeArrivee = formData.get('Ville_arrivee');
        const date = formData.get('date_publication');
        const heure = document.getElementById('pubHeure')?.value;
        const prix = document.getElementById('pubPrix')?.value;
        const places = document.getElementById('pubPlaces')?.value;

        if (!villeDepart || !villeArrivee || !date || !heure || !prix || !places) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        if (parseInt(places) < 1 || parseInt(places) > 8) {
            showNotification('Le nombre de places doit être entre 1 et 8', 'error');
            return;
        }

        formData.append('heure_depart', heure);
        formData.append('prix', prix);
        formData.append('places_disponibles', places);
        formData.append('description', document.getElementById('pubDesc')?.value || '');

        try {
            await fetch(pubForm.action, { method: 'POST', body: formData });
            showNotification('Trajet publié avec succès !', 'success');
            pubForm.reset();
            setTimeout(() => window.location.href = './main.html', 1500);
        } catch (error) {
            console.error('Erreur publication:', error);
            showNotification('Erreur lors de la publication', 'error');
        }
    });
});

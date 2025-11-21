pubForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(pubForm);
    const villeDepart = formData.get('Ville_depart');
    const villeArrivee = formData.get('Ville_arrivee');
    const date = formData.get('date_publication');
    const heure = document.getElementById('pubHeure')?.value;
    const prix = document.getElementById('pubPrix')?.value;
    const places = document.getElementById('pubPlaces')?.value;

    // Vérifications
    if (!villeDepart || !villeArrivee || !date || !heure || !prix || !places) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (parseInt(places) < 1 || parseInt(places) > 5) {
        showNotification('Le nombre de places doit être entre 1 et 5', 'error');
        return;
    }

    const selectedDateTime = new Date(`${date}T${heure}`);
    if (selectedDateTime <= new Date()) {
        showNotification('La date et l’heure doivent être dans le futur', 'error');
        return;
    }

    // Ajout des champs au FormData
    formData.append('heure_depart', heure);
    formData.append('prix', prix);
    formData.append('places_disponibles', places);
    formData.append('description', document.getElementById('pubDesc')?.value || '');

    try {
        const response = await fetch(pubForm.action, { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            pubForm.reset();
            setTimeout(() => window.location.href = '/AlloCovoit/front-end/route/explore_rides.html', 1500);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Erreur publication:', error);
        showNotification('Erreur lors de la publication', 'error');
    }
});

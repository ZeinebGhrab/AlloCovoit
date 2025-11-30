export function reservationNavigation(tabSelector = '.tab-btn', contentSelector = '.tab-content') {
    const tabs = document.querySelectorAll(tabSelector);
    const contents = document.querySelectorAll(contentSelector);

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les onglets et contenus
            tabs.forEach(b => b.classList.remove('active'));
            contents.forEach(tc => tc.classList.remove('active'));

            // Ajouter active au bouton cliqué et au contenu correspondant
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
        });
    });
}

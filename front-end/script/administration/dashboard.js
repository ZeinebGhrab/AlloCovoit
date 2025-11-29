import { loadUsersSection } from "../users/users_section.js";
import { loadTrajetsSectionAdmin } from "../routes/routes_section.js";
import { loadReservationsSection } from "../reservations/reservations_section.js";

export function navigationAdmin() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.content-section');

    // Dashboard actif par défaut
    sections.forEach(sec => sec.classList.toggle('active', sec.id === 'dashboard'));
    menuButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === 'dashboard'));

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sectionId = btn.dataset.section;
            sections.forEach(sec => {
                sec.classList.toggle('active', sec.id === sectionId);
            });

            // Charger le contenu dynamique
            if (sectionId === "users") loadUsersSection();
            if (sectionId === "trajets") loadTrajetsSectionAdmin();
            if (sectionId === "reservations") loadReservationsSection();
        });
    });
}

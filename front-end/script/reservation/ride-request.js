import { showNotification } from '../utils.js';

let receivedRequests = [];
let myReservations = [];
let currentAction = null;
let selectedReservationId = null;

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous les boutons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.dataset.tab;
            // Afficher uniquement le contenu correspondant
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
        });
    });
});


// === Initialisation globale ===
export async function initRideRequests() {
   
    await Promise.all([
        loadReceivedRequests(),
        loadMyReservations()
    ]);
    // Initialisation des filtres
    setupReceivedRequestsFilter();
    setupMyReservationsFilter();
    setupModalEvents();
}

// === Charger les demandes reçues ===
async function loadReceivedRequests() {
    const container = document.getElementById('demandesRecuesListe');
    container.innerHTML = '<p>Chargement...</p>';

    try {
        const res = await fetch('/AlloCovoit/back-end/reservation/api/get_received_request.php');
        const data = await res.json();

        container.innerHTML = '';

        if (!data.success || !Array.isArray(data.received_requests) || data.received_requests.length === 0) {
            container.innerHTML = `<p style="color: gray;">Aucune demande reçue.</p>`;
            return;
        }

        receivedRequests = data.received_requests;
        displayReceivedRequests(container, receivedRequests);

    } catch (e) {
        console.error('Erreur get_received_requests:', e);
        showNotification('Erreur lors du chargement des demandes reçues', 'error');
        container.innerHTML = `<p style="color: gray;">Erreur de chargement.</p>`;
    }
}


// === Afficher les demandes reçues ===
function displayReceivedRequests(container, requests) {
    container.innerHTML = '';
    
    // Styles du container
    Object.assign(container.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        padding: '1rem',
        maxWidth: '1400px',
        margin: '0 auto'
    });
    
    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        // Styles de la carte
        Object.assign(card.style, {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        // Effet hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)';
        });
        
        // Créer le contenu
        const title = document.createElement('h3');
        title.textContent = `👤 ${req.nom_passager || 'Passager inconnu'}`;
        Object.assign(title.style, {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 1rem 0'
        });
        
        const route = document.createElement('p');
        route.textContent = `${req.ville_depart} → ${req.ville_arrivee}`;
        Object.assign(route.style, {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#4F46E5',
            margin: '0 0 0.75rem 0',
            padding: '0.5rem',
            background: 'rgba(79, 70, 229, 0.08)',
            borderRadius: '8px',
            borderLeft: '3px solid #4F46E5'
        });
        
        const dateInfo = document.createElement('p');
        dateInfo.innerHTML = `<i class="fa-solid fa-calendar" style="color: #6366f1; margin-right: 0.5rem;"></i> ${req.date_depart} à ${req.heure_depart}`;
        Object.assign(dateInfo.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center'
        });
        
        const places = document.createElement('p');
        places.innerHTML = `<i class="fa-solid fa-users" style="color: #6366f1; margin-right: 0.5rem;"></i> Places réservées : ${req.nombre_places}`;
        Object.assign(places.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center'
        });
        
        const price = document.createElement('p');
        price.innerHTML = `<i class="fa-solid fa-money-bill" style="color: #6366f1; margin-right: 0.5rem;"></i> Prix : <strong>${req.prix} DT</strong>`;
        Object.assign(price.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center'
        });
        
        const statusContainer = document.createElement('p');
        statusContainer.style.margin = '0.5rem 0';
        statusContainer.innerHTML = 'Statut : ';
        
        const badge = document.createElement('span');
        badge.textContent = req.statut_reservation;
        Object.assign(badge.style, {
            display: 'inline-block',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginLeft: '0.5rem'
        });
        
        // Couleurs selon le statut
        const statusStyles = {
            'en_attente': {
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                color: '#92400e',
                border: '1px solid #fbbf24'
            },
            'confirmee': {
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                color: '#065f46',
                border: '1px solid #10b981'
            },
            'annulee': {
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                color: '#991b1b',
                border: '1px solid #ef4444'
            },
            'terminee': {
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                color: '#3730a3',
                border: '1px solid #818cf8'
            }
        };
        
        Object.assign(badge.style, statusStyles[req.statut_reservation] || statusStyles['en_attente']);
        statusContainer.appendChild(badge);
        
        // Ajouter tous les éléments à la carte
        card.append(title, route, dateInfo, places, price, statusContainer);
        
        // Boutons d'action
        if (req.statut_reservation === 'en_attente') {
            const btnContainer = document.createElement('div');
            Object.assign(btnContainer.style, {
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
            });
            
            const btnConfirm = document.createElement('button');
            btnConfirm.innerHTML = '<i class="fa-solid fa-check"></i> Confirmer';
            btnConfirm.className = 'btn-confirm';
            Object.assign(btnConfirm.style, {
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                flex: '1',
                minWidth: '140px'
            });
            
            btnConfirm.addEventListener('mouseenter', () => {
                btnConfirm.style.background = 'linear-gradient(135deg, #059669, #047857)';
                btnConfirm.style.transform = 'translateY(-2px)';
                btnConfirm.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            });
            
            btnConfirm.addEventListener('mouseleave', () => {
                btnConfirm.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btnConfirm.style.transform = 'translateY(0)';
                btnConfirm.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
            
            btnConfirm.addEventListener('click', () => openModal(req.id_reservation, 'confirm'));
            
            const btnReject = document.createElement('button');
            btnReject.innerHTML = '<i class="fa-solid fa-ban"></i> Refuser';
            btnReject.className = 'btn-reject';
            Object.assign(btnReject.style, {
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                flex: '1',
                minWidth: '140px'
            });
            
            btnReject.addEventListener('mouseenter', () => {
                btnReject.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                btnReject.style.transform = 'translateY(-2px)';
                btnReject.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            });
            
            btnReject.addEventListener('mouseleave', () => {
                btnReject.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                btnReject.style.transform = 'translateY(0)';
                btnReject.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
            
            btnReject.addEventListener('click', () => openModal(req.id_reservation, 'cancel'));
            
            btnContainer.append(btnConfirm, btnReject);
            card.appendChild(btnContainer);
        }
        
        container.appendChild(card);
        updateReceivedRequestsStats(requests);
    });
    
    // Message si aucune réservation
    if (requests.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #6b7280; grid-column: 1 / -1;">
                <i class="fa-solid fa-inbox" style="font-size: 4rem; color: #d1d5db; display: block; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; font-weight: 500;">Aucune demande de réservation</p>
            </div>
        `;
        container.appendChild(emptyState);
    }
}

// Responsive pour mobile (à ajouter dans un media query ou via JS)
function applyResponsiveStyles() {
    if (window.innerWidth <= 768) {
        const containers = document.querySelectorAll('.reservation-card').forEach(card => {
            const btnContainer = card.querySelector('div:last-child');
            if (btnContainer) {
                btnContainer.style.flexDirection = 'column';
                const buttons = btnContainer.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.style.width = '100%';
                    btn.style.minWidth = 'unset';
                });
            }
        });
    }
}

// Appeler au chargement et au redimensionnement
window.addEventListener('resize', applyResponsiveStyles);
window.addEventListener('load', applyResponsiveStyles);


// === Filtrage des demandes reçues ===
function setupReceivedRequestsFilter() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const filtered = filter === 'tous'
                ? receivedRequests
                : receivedRequests.filter(r => r.statut_reservation === filter);

            const container = document.getElementById('demandesRecuesListe');
            displayReceivedRequests(container, filtered);
        });
    });
}


// === Charger mes réservations ===
async function loadMyReservations() {
    const container = document.getElementById('mesReservationsListe');
    container.innerHTML = '<p>Chargement...</p>';

    try {
        const res = await fetch(`/AlloCovoit/back-end/reservation/api/get_user_reservation.php`);
        const data = await res.json();
        container.innerHTML = '';

        if (!data.success || !Array.isArray(data.reservations) || data.reservations.length === 0) {
            container.innerHTML = `<p style="color: gray;">Aucune réservation effectuée.</p>`;
            return;
        }

        myReservations = data.reservations;
        displayMyReservations(container);

    } catch (e) {
        console.error('Erreur get_user_reservations:', e);
        showNotification('Erreur lors du chargement de vos réservations', 'error');
        container.innerHTML = `<p style="color: gray;">Erreur de chargement.</p>`;
    }
}

// === Afficher le nombre des demandes reçues par filtre ===

function updateReceivedRequestsStats(requests) {
    const counts = {
        en_attente: 0,
        'confirmé': 0,
        annulé: 0
    };

    requests.forEach(r => {
        const status = r.statut_reservation;
        if (counts.hasOwnProperty(status)) counts[status]++;
    });

    document.getElementById('pendingCount').textContent = counts.en_attente;
    document.getElementById('confirmedCount').textContent = counts['confirmé'];
    document.getElementById('rejectedCount').textContent = counts.annulé;
    document.getElementById('totalDemandesCount').textContent = requests.length;

    // Mettre à jour les badges des onglets
    document.getElementById('demandesBadge').textContent = requests.length;
}


// === Afficher mes réservations ===
function displayMyReservations(container) {
    container.innerHTML = '';
    
    // Styles du container
    Object.assign(container.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        padding: '1rem',
        maxWidth: '1400px',
        margin: '0 auto'
    });
    
    myReservations.forEach(r => {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        // Styles de la carte
        Object.assign(card.style, {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        // Effet hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)';
        });
        
        // Titre avec icône de localisation
        const title = document.createElement('h3');
        title.innerHTML = `<i class="fa-solid fa-route" style="color: #4F46E5; margin-right: 0.5rem;"></i>${r.ville_depart} → ${r.ville_arrivee}`;
        Object.assign(title.style, {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem',
            background: 'rgba(79, 70, 229, 0.08)',
            borderRadius: '8px',
            borderLeft: '3px solid #4F46E5'
        });
        
        // Date et heure
        const dateInfo = document.createElement('p');
        dateInfo.innerHTML = `<i class="fa-solid fa-calendar" style="color: #6366f1; width: 24px;"></i>${r.date_depart} à ${r.heure_depart}`;
        Object.assign(dateInfo.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        // Prix
        const price = document.createElement('p');
        price.innerHTML = `<i class="fa-solid fa-money-bill-wave" style="color: #6366f1; width: 24px;"></i>Prix : <strong style="color: #10b981; font-size: 1.05rem;">${r.prix} DT</strong>`;
        Object.assign(price.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        // Places
        const places = document.createElement('p');
        places.innerHTML = `<i class="fa-solid fa-users" style="color: #6366f1; width: 24px;"></i>Places : <strong>${r.nombre_places}</strong>`;
        Object.assign(places.style, {
            color: '#4b5563',
            fontSize: '0.95rem',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        // Statut
        const statusContainer = document.createElement('p');
        Object.assign(statusContainer.style, {
            margin: '0.75rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        const statusLabel = document.createElement('span');
        statusLabel.innerHTML = '<i class="fa-solid fa-info-circle" style="color: #6366f1; width: 24px;"></i>Statut :';
        statusLabel.style.color = '#4b5563';
        statusLabel.style.fontSize = '0.95rem';
        statusLabel.style.display = 'flex';
        statusLabel.style.alignItems = 'center';
        statusLabel.style.gap = '0.5rem';
        
        const badge = document.createElement('span');
        badge.textContent = r.statut_reservation;
        Object.assign(badge.style, {
            display: 'inline-block',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        });
        
        // Couleurs selon le statut
        const statusStyles = {
            'en_attente': {
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                color: '#92400e',
                border: '1px solid #fbbf24',
                icon: 'fa-clock'
            },
            'confirmé': {
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                color: '#065f46',
                border: '1px solid #10b981',
                icon: 'fa-check-circle'
            },
            'annulé': {
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                color: '#991b1b',
                border: '1px solid #ef4444',
                icon: 'fa-times-circle'
            },
            'terminée': {
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                color: '#3730a3',
                border: '1px solid #818cf8',
                icon: 'fa-flag-checkered'
            }
        };
        
        const currentStatus = statusStyles[r.statut_reservation] || statusStyles['en_attente'];
        Object.assign(badge.style, currentStatus);
        
        // Ajouter une icône au badge
        const badgeIcon = document.createElement('i');
        badgeIcon.className = `fa-solid ${currentStatus.icon}`;
        badgeIcon.style.marginRight = '0.3rem';
        badge.prepend(badgeIcon);
        
        statusContainer.append(statusLabel, badge);
        
        // Ajouter tous les éléments à la carte
        card.append(title, dateInfo, price, places, statusContainer);
        
        // Bouton d'annulation (seulement si confirmé)
        if (r.statut_reservation === 'confirmé' || r.statut_reservation === 'confirmée') {
            const btnContainer = document.createElement('div');
            Object.assign(btnContainer.style, {
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
            });
            
            const btnCancel = document.createElement('button');
            btnCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Annuler la réservation';
            btnCancel.className = 'btn-cancel';
            Object.assign(btnCancel.style, {
                width: '100%',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            });
            
            btnCancel.addEventListener('mouseenter', () => {
                btnCancel.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                btnCancel.style.transform = 'translateY(-2px)';
                btnCancel.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            });
            
            btnCancel.addEventListener('mouseleave', () => {
                btnCancel.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                btnCancel.style.transform = 'translateY(0)';
                btnCancel.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
            
            btnCancel.addEventListener('click', () => openModal(r.id_reservation, 'cancel'));
            
            btnContainer.appendChild(btnCancel);
            card.appendChild(btnContainer);
        }
        
        container.appendChild(card);
    });
    
    // Message si aucune réservation
    if (myReservations.length === 0) {
        const emptyState = document.createElement('div');
        Object.assign(emptyState.style, {
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280',
            gridColumn: '1 / -1'
        });
        
        emptyState.innerHTML = `
            <i class="fa-solid fa-ticket" style="font-size: 4rem; color: #d1d5db; display: block; margin-bottom: 1rem;"></i>
            <p style="font-size: 1.1rem; font-weight: 500; margin: 0;">Aucune réservation pour le moment</p>
            <p style="font-size: 0.95rem; color: #9ca3af; margin-top: 0.5rem;">Vos réservations apparaîtront ici</p>
        `;
        container.appendChild(emptyState);
    }
    updateMyReservationsStats(myReservations);
}

// Responsive pour mobile
function applyMyReservationsResponsive() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.reservation-card').forEach(card => {
            const btnCancel = card.querySelector('.btn-cancel');
            if (btnCancel) {
                btnCancel.style.fontSize = '0.9rem';
                btnCancel.style.padding = '0.7rem 1rem';
            }
        });
    }
}

// Appeler au chargement et au redimensionnement
window.addEventListener('resize', applyMyReservationsResponsive);
window.addEventListener('load', applyMyReservationsResponsive);

// === Filtrage mes réservations ===
function setupMyReservationsFilter() {
    const filterButtons = document.querySelectorAll('.btn-filter-res');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filterRes;
            const filtered = filter === 'tous'
                ? myReservations
                : myReservations.filter(r => r.statut_reservation === filter);

            const container = document.getElementById('mesReservationsListe');
            displayMyReservations(container, filtered);
        });
    });
}

// === Afficher le nombre des réservations par filtre ===
function updateMyReservationsStats(reservations) {
    const counts = {
        en_attente: 0,
        'confirmé': 0,
        annulé: 0
    };

    reservations.forEach(r => {
        const status = r.statut_reservation;
        if (counts.hasOwnProperty(status)) counts[status]++;
    });

    document.getElementById('myPendingCount').textContent = counts.en_attente;
    document.getElementById('myConfirmedCount').textContent = counts['confirmé'];
    document.getElementById('myRejectedCount').textContent = counts.annulé;
    document.getElementById('totalReservationsCount').textContent = reservations.length;

    // Badge onglet
    document.getElementById('reservationsBadge').textContent = reservations.length;
}


// === Gestion de la modale ===
function openModal(id, action) {
    selectedReservationId = id;
    currentAction = action;

    const modal = document.getElementById('cancelModal');
    if (!modal) return console.error('Modal non trouvée !');

    const title = modal.querySelector('h3');
    const message = modal.querySelector('p');
    const confirmBtn = modal.querySelector('#modalConfirmBtn');

    if (!title || !message || !confirmBtn) {
        return console.error('Éléments de la modale manquants !');
    }

    if (action === 'confirm') {
        title.textContent = "Confirmer la réservation";
        message.textContent = "Voulez-vous confirmer cette réservation ?";
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmer';
        confirmBtn.style.background = '#28a745';
    } else if (action === 'cancel') {
        title.textContent = "Annuler la réservation";
        message.textContent = "Êtes-vous sûr de vouloir annuler cette réservation ?";
        confirmBtn.innerHTML = '<i class="fas fa-ban"></i> Annuler';
        confirmBtn.style.background = '#dc3545';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('cancelModal');
    if (!modal) return;
    modal.style.display = 'none';
    selectedReservationId = null;
    currentAction = null;
}

function setupModalEvents() {
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');

    if (confirmBtn) confirmBtn.addEventListener('click', confirmAction);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    document.querySelectorAll('.modal').forEach(m => {
        m.addEventListener('click', e => {
            if (e.target === m) closeModal(); // fermer si clic sur le fond
        });
    });
}

// === Confirmer ou annuler via API ===
async function confirmAction() {
    if (!selectedReservationId || !currentAction) {
        return showNotification('Aucune réservation sélectionnée', 'error');
    }

    const endpoint = currentAction === 'confirm'
        ? '/AlloCovoit/back-end/reservation/api/confirm_reservation.php'
        : '/AlloCovoit/back-end/reservation/api/cancel_reservation.php';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_reservation: selectedReservationId })
        });

        const data = await res.json();

        if (data.success) {
            showNotification(
                currentAction === 'confirm'
                    ? 'Réservation confirmée avec succès'
                    : 'Réservation annulée avec succès',
                'success'
            );
            closeModal();
            initRideRequests(); // Recharger les listes
        } else {
            showNotification('Erreur lors de la mise à jour', 'error');
        }
    } catch (e) {
        console.error('Erreur confirmAction:', e);
        showNotification('Erreur serveur', 'error');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', setupModalEvents);

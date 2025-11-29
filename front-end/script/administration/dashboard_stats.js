export async function loadDashboardStats() {
    const stats = [
        { url: '/AlloCovoit/back-end/route/api/get_total_trajets.php', id: 'totalTrajets' },
        { url: '/AlloCovoit/back-end/user/api/user/get_total_users.php', id: 'totalUsers' },
        { url: '/AlloCovoit/back-end/reservation/api/get_reservations_count.php', id: 'totalReservations' }
    ];

    stats.forEach(async stat => {
        try {
            const res = await fetch(stat.url);
            const data = await res.json();
            document.getElementById(stat.id).textContent = Object.values(data)[0] ?? 0;
        } catch {
            document.getElementById(stat.id).textContent = 0;
        }
    });
}

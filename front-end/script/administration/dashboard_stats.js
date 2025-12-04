export async function loadDashboardStats() {
    const stats = [
        { url: '/AlloCovoit/back-end/route/api/get_total_trajets.php', id: 'totalTrajets' },
        { url: '/AlloCovoit/back-end/user/api/user/get_total_users.php', id: 'totalUsers' },
        { url: '/AlloCovoit/back-end/route/api/get_total_revenue.php', id: 'totalRevenue' }
    ];

    stats.forEach(async stat => {
        try {
            const res = await fetch(stat.url);
            const data = await res.json();
            console.log(data);
            document.getElementById(stat.id).textContent = Object.values(data)[0] ?? 0;
        } catch {
            document.getElementById(stat.id).textContent = 0;
        }
    });

    try {
        const res = await fetch('/AlloCovoit/back-end/reservation/api/get_reservations_count.php');
        const data = await res.json();
        document.getElementById('totalReservations').textContent = Object.values(data)[1] ?? 0;
    } catch {
        document.getElementById('totalReservations').textContent = 0;
    }
}

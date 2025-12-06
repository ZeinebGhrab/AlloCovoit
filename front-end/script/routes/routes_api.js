export async function fetchTrajetsAdmin(page = 1, limit = 8) {
    try {
        const response = await fetch('/AlloCovoit/back-end/route/api/get_routes_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des trajets.');
        return await response.json();

    } catch (err) {
        console.error(err);
        return { trajets: [], totalPages: 0 };
    }
}

export async function addTrajet(formData) {
    try {
        const response = await fetch('/AlloCovoit/back-end/route/api/save.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json(); 
        return data;

    } catch (err) {
        console.error(err);
        return { error: err };
    }
}


export async function validateTrajet(id) {
    return callTrajetApi('/AlloCovoit/back-end/route/api/validate_route.php', id);
}

export async function refuseTrajet(id) {
    return callTrajetApi('/AlloCovoit/back-end/route/api/refuse_route.php', id);
}

export async function deleteTrajet(id) {
    return callTrajetApi('/AlloCovoit/back-end/route/api/delete.php', id);
}

async function callTrajetApi(url, id) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_trajet: id })
        });
        return await response.json();
    } catch (err) {
        console.error(err);
        return { error: 'Erreur serveur' };
    }
}

let currentPage = 1;
let currentFilters = {};

export async function fetchTrajets(filters = {}, page = 1, limit = 10) {
    try {
        currentPage = page;
        currentFilters = filters;

        const body = { ...filters, page, limit };

        const response = await fetch("/AlloCovoit/back-end/route/api/get_routes.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return {
            trajets: Array.isArray(data.trajets) ? data.trajets : [],
            totalPages: data.totalPages || 0
        };
    } catch (err) {
        console.error(err);
        return { trajets: [], totalPages: 0 };
    }
}


let allTrajets = [];
const limit = 5;

export async function fetchMyTrajets(filters = {}, page = 1) {
    currentPage = page;

    try {
        const res = await fetch('/AlloCovoit/back-end/route/api/get_my_routes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters, page: currentPage, limit })
        });

        const data = await res.json();

        allTrajets = data.trajets ? data.trajets : [];
        return data;
    } catch (err) {
        console.error('Erreur lors du fetch des trajets :', err);
        return [];
    }
}

export async function performActionOnTrajet(id_trajet, action) {
    const url = action === 'cancel' 
        ? '/AlloCovoit/back-end/route/api/cancel.php'
        : '/AlloCovoit/back-end/route/api/delete.php';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_trajet })
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return { success: false };
    }
}

export { allTrajets, currentPage, limit };

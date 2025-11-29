import { fetchTrajetsAdmin, fetchTrajets } from "./routes_api.js";
import { renderTrajetsAdmin, renderTrajets } from "./routes_render.js";
import { displayPagination } from "../utils.js";

let currentTrajetPage = 1;
const trajetsPerPage = 10;

export async function loadTrajetsSectionAdmin(filters = {}, page = 1, limit = trajetsPerPage) {

    const container = document.getElementById("trajets");

    currentTrajetPage = page;

    const data = await fetchTrajetsAdmin(page, limit);

    renderTrajetsAdmin(data.trajets || [], container);

    displayPagination(
        data.totalPages || 1,
        currentTrajetPage,
        loadTrajetsSectionAdmin,
        filters,
        limit,
        "trajets-pagination"
    );
}



let currentPage = 1;
let currentFilters = {};
const limit = 10;

export async function loadTrajetsSection(filters = {}, page = 1, limitParam = limit) {
    try {
        currentPage = page;
        currentFilters = filters;

        const { trajets, totalPages } = await fetchTrajets(filters, page, limitParam);

        if (!trajets) {
            showNotification("Erreur lors du chargement des trajets.");
        }

        renderTrajets(trajets);
        displayPagination(totalPages, currentPage, loadTrajetsSection, currentFilters, limitParam, 'paginationContainer');
    } catch (err) {
        console.error(err);
        showNotification("Erreur lors du chargement des trajets.");
    }
}
import { fetchUsers } from "./users_api.js";
import { displayUsers } from "./users_render.js";
import { displayPagination } from "../utils.js";

let currentPage = 1;
const usersPerPage = 10;

export async function loadUsersSection(filters = {}, page = 1, limit = usersPerPage) {

    currentPage = page;

    const container = document.getElementById("users");

    const data = await fetchUsers(page, limit);

    displayUsers(data.users, container);

    displayPagination(
        data.totalPages,
        currentPage,
        loadUsersSection,
        {},
        limit,
        "users-pagination"
    );
}

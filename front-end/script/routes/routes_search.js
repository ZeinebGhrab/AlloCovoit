import { loadTrajetsSection } from './routes_section.js';

const limit = 10;

export function searchTrajets() {
    const depart = document.getElementById("searchDepart")?.value.trim() || '';
    const arrivee = document.getElementById("searchArrivee")?.value.trim() || '';
    const date = document.querySelector("input[type='date']")?.value || '';

    loadTrajetsSection({ depart, arrivee, date }, 1, limit);
}

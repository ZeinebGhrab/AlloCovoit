import { validateTrajet, refuseTrajet, deleteTrajet } from "./routes_api.js";
import { loadTrajetsSectionAdmin } from "./routes_section.js";
import { showNotification } from "../utils.js";

export async function handleTrajetAction(type, id) {
    let result = null;

    if (type === "validate") {
        result = await validateTrajet(id);
        loadTrajetsSectionAdmin();
    }
    if (type === "refuse") {
        result = await refuseTrajet(id);
        loadTrajetsSectionAdmin();
    }
    if (type === "delete") {
        result = await deleteTrajet(id);
        loadTrajetsSectionAdmin();
    }

    showNotification(result.message || result.error);
}

// trajets_actions.js
import { validateTrajet, refuseTrajet, deleteTrajet } from "./routes_api.js";
import { showNotification } from "../utils.js";

export async function handleTrajetAction(type, id) {
    let result = null;

    if (type === "validate") result = await validateTrajet(id);
    if (type === "refuse") result = await refuseTrajet(id);
    if (type === "delete") result = await deleteTrajet(id);

    showNotification(result.message || result.error);
}

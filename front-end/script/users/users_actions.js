import { callUserApi } from "./users_api.js";
import { showNotification } from "../utils.js";

export async function blockUser(id) {
    const data = await callUserApi('/AlloCovoit/back-end/user/api/user/block_user.php', id);
    showNotification(data.message);
}

export async function unblockUser(id) {
    const data = await callUserApi('/AlloCovoit/back-end/user/api/user/unblock_user.php', id);
    showNotification(data.message);
}

export async function deleteUser(id) {
    const data = await callUserApi('/AlloCovoit/back-end/user/api/user/delete_user.php', id);
    showNotification(data.message);
}

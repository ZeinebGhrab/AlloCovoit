export async function fetchUsers(search ,page, limit) {
    try {
        const response = await fetch('/AlloCovoit/back-end/user/api/user/get_users.php', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search ,page, limit })
        });

        return await response.json();
    } catch (err) {
        return { users: [], totalPages: 0 };
    }
}

export async function callUserApi(url, id) {
    const formData = new FormData();
    formData.append("id", id);

    const res = await fetch(url, { method: "POST", body: formData });
    return await res.json();
}

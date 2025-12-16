import { addTrajet } from "./routes_api.js";
import { showNotification } from '../utils.js';

export function initPublicationForm() {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const res = await addTrajet(formData);
        console.log(res);

        if (res.success) {
            showNotification(res.message);
            setTimeout(() => {
                window.location.href = "/AlloCovoit/front-end/interfaces/route/ride-publication.html";
            }, 1000);
        } else {
            showNotification(res.message);
            console.log(res.message);
        }
    });
}
// https://notify-bot.line.me/oauth/token

import axios from "axios";
const notifyBaseUrl = "https://notify-bot.line.me";

async function fetchAuthorize() {
    try {
        axios.post(`${notifyBaseUrl}/oauth/token`, {
            params: {
                grant_type: "authorization_code",
            },
        });
    } catch (error) {
        return {
            status: error.response.status,
            data: error.response.data,
        };
    }
}


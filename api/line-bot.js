const axios = require("./axios.js");
const dotenv = require("dotenv");

dotenv.config();
const { env } = process;
const TOKEN = env.LINE_ACCESS_TOKEN;
const LINE_BASE_URL = "https://api.line.me";

async function sendMessage(messages = [], { replyToken }) {
    try {
        const response = await axios.post(
            `${LINE_BASE_URL}/v2/bot/message/reply`,
            {
                replyToken,
                messages,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + TOKEN,
                },
            }
        );

        return response;
    } catch (error) {
        return error;
    }
}

async function getUserProfile(userId) {
    try {
        const response = await axios.get(`${LINE_BASE_URL}/v2/bot/profile/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + TOKEN,
            },
        });

        return response;
    } catch (error) {
        return error;
    }
}

module.exports = {
    sendMessage,
    getUserProfile,
};


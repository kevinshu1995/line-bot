const axios = require("./axios.js");
const dotenv = require("dotenv");

dotenv.config();
const { env } = process;
const TOKEN = env.LINE_ACCESS_TOKEN;
const LINE_BASE_URL = "https://api.line.me";

async function sendMessage(messages = [], { replyToken }) {
    try {
        const { data, status } = await axios.post(
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

        return { data, error: null, status };
    } catch (error) {
        return {
            data: null,
            error,
            status: error?.response?.status ?? 500,
        };
    }
}

async function getUserProfile(userId) {
    try {
        const { data, status } = await axios.get(`${LINE_BASE_URL}/v2/bot/profile/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + TOKEN,
            },
        });

        // data = {
        //     userId: String,
        //     displayName: String,
        //     pictureUrl: String, // url
        //     language: "en",
        // };

        return { data, error: null, status };
    } catch (error) {
        return { data: null, error, status: error?.response?.status ?? 500 };
    }
}

module.exports = {
    sendMessage,
    getUserProfile,
};


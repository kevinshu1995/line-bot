const axios = require("./axios.js");
const dotenv = require("dotenv");

dotenv.config();
const { env } = process;
const TOKEN = env.LINE_ACCESS_TOKEN;

async function sendMessage(messages = [], { replyToken }) {
    try {
        const response = await axios.post(
            "https://api.line.me/v2/bot/message/reply",
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

module.exports = {
    sendMessage,
};


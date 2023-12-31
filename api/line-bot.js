import axios from "./axios.js";
import { isAxiosError } from "axios";
import dotenv from "dotenv";

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
        if (isAxiosError(error) === false) {
            console.error("sendMessage error \n", error);
        }
        return {
            data: null,
            error,
            status: error?.status ?? 555,
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
        if (isAxiosError(error) === false) {
            console.error("sendMessage error \n", error);
        }
        return { data: null, error, status: error?.response?.status ?? 555 };
    }
}

async function validateReply({ messages = [] }) {
    try {
        const { data, status } = await axios.post(
            `${LINE_BASE_URL}/v2/bot/message/validate/reply`,
            {
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
        if (isAxiosError(error) === false) {
            console.error("sendMessage error \n", error);
        }
        return {
            data: null,
            error,
            status: error?.status ?? 555,
        };
    }
}

const replyNothingMockApiResult = extraData => ({
    data: {
        message: "Nothing to reply",
        ...(extraData || {}),
    },
    error: null,
    status: 204,
});

export default {
    sendMessage,
    validateReply,
    getUserProfile,
    replyNothingMockApiResult,
};


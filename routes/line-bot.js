const express = require("express");
const axios = require("axios");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const { env } = process;

const TOKEN = env.LINE_ACCESS_TOKEN;

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.post("/webhook", async function (req, res) {
    const responses = await Promise.all(
        req.body.events
            .filter(event => event.type === "message" && event.mode === "active")
            .filter(event => {
                return event.message.type === "text";
            })
            .map(event => {
                const userMessage = event.message.text;
                return axios
                    .post(
                        "https://api.line.me/v2/bot/message/reply",
                        {
                            replyToken: event.replyToken,
                            // Define reply messages
                            messages: [
                                {
                                    type: "text",
                                    text: "Hello, user",
                                },
                                {
                                    type: "text",
                                    text: userMessage,
                                },
                            ],
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + TOKEN,
                            },
                        }
                    )
                    .then(response => {
                        return response;
                    })
                    .catch(error => {
                        return error;
                    });
            })
    );

    const isAllSuccess = responses.every(response => {
        const status = response?.status;
        if (status === undefined) return false;
        return status >= 200 && status < 300;
    });

    if (isAllSuccess) {
        res.status(200).send("OK");
        return;
    }

    const firstStatus = responses.find(error => {
        if (error?.response?.status) {
            return error;
        }
    })?.status;

    const responseError = responses.map(response => {
        console.error(response);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return {
                config: error.config,
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
                message: error.message,
            };
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            return {
                config: error.config,
                request: error.request,
                message: error.message,
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            return {
                config: error.config,
                message: error.message,
            };
        }
    });

    res.status(firstStatus ?? 500).send(responseError);
});

module.exports = router;


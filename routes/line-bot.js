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

router.post("/webhook", function (req, res) {
    const events = req.body.events;
    // Request header. See Messaging API reference for specification
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
    };

    events.forEach(event => {
        if (event.type === "message" && event.mode === "active") {
            if (event.message.type === "text") {
                const userMessage = event.message.text;
                axios
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
                            headers,
                        }
                    )
                    .then(response => {
                        console.log(response);
                        res.status(200).send(response);
                    })
                    .catch(error => {
                        console.log(error);
                        if (error.response) {
                            res.status(error.response.status).send(error.response.response);
                            return;
                        }
                        res.status(500).send(error);
                    });
            }
        }
    });
});

module.exports = router;


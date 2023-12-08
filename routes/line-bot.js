const express = require("express");
const { sendMessage } = require("../api/line-bot");
const router = express.Router();

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
                return sendMessage(
                    (messages = [
                        {
                            type: "text",
                            text: "Hello, user",
                        },
                        {
                            type: "text",
                            text: userMessage,
                        },
                    ]),
                    { replyToken: event.replyToken }
                );
            })
    );

    const isAllSuccess = responses.every(response => {
        const status = response?.status;
        if (status === undefined) return false;
        return status >= 200 && status < 300;
    });

    if (isAllSuccess) {
        res.setHeader("Content-Type", "application/json");
        const responseJson = {
            message: "Success",
            responses: responses.map(res => res.data),
        };
        res.status(200).json(responseJson);
        return;
    }

    const firstStatus = responses.find(error => {
        if (error?.response?.status) {
            return error;
        }
    })?.status;

    res.status(firstStatus ?? 500).json(responses);
});

module.exports = router;


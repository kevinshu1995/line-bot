const express = require("express");
const { replyCommandOnly } = require("../reply/command.js");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.post("/webhook", async function (req, res) {
    const responses = await Promise.all(replyCommandOnly(req));

    const isAllSuccess = responses.every(response => {
        if (response === null) return true;
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


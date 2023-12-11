const express = require("express");
const Reply = require("../reply/index.js");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.post("/webhook", async function (req, res) {
    const responses = await Promise.all(Reply(req));

    const isAllSuccess = responses.every(({ status }) => {
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

    const firstStatus = responses.find(({ error }) => {
        return error !== null;
    })?.status;

    res.status(firstStatus ?? 500).json(responses);
});

module.exports = router;


const express = require("express");
const Reply = require("../reply/index.js");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.post("/webhook", async function (req, res) {
    try {
        const responses = await Promise.all(Reply(req));
        const errorAry = responses.filter(r => r.error !== null);
        res.setHeader("Content-Type", "application/json");

        if (errorAry.length > 0) {
            const errorMsgs = errorAry.map((e, i) => `error ${i + 1}: ${e?.error?.message}`).join("\n");
            res.status(errorAry[0]?.status ?? 500).send({ error: errorMsgs });
            return;
        }

        res.status(200).json({
            message: "Success",
            responses: responses.map(r => r.data),
        });

        return;
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;


import express from "express";
import axios from "axios";
import Reply from "../reply/index.js";
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
            res.status(errorAry[0]?.status ?? 555).send({ error: errorMsgs });
            return;
        }

        res.status(200).json({
            message: "Success",
            responses: responses.map(r => r.data),
        });

        return;
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            console.log("webhook error: ", error);
        }
        res.status(555).json(error);
    }
});

export default router;


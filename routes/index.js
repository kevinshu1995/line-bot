const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.get("/status", function (req, res, next) {
    res.status(200).send("Server is ok");
});

module.exports = router;


const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const TOKEN = dotenv.parsed.LINE_ACCESS_TOKEN;

/* GET home page. */
router.get("/", function (req, res, next) {
    res.status(200).send("Hello, this is line-bot server.");
});

router.get("/status", function (req, res, next) {
    res.status(200).send("Server is ok");
});

module.exports = router;


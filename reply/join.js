const { sendMessage } = require("../api/line-bot");
const { messages } = require("./configs");

module.exports = function JoinMessage(req) {
    // join ==========
    const validJoinEvents = req.body.events.filter(event => event?.type === "join");
    return validJoinEvents.map(event => {
        return sendMessage(
            [
                {
                    type: "text",
                    text: messages.join.reply(),
                },
            ],
            { replyToken: event.replyToken }
        );
    });
};


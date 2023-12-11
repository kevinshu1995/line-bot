const JoinMessage = require("./join");
const CommandMessage = require("./command");

function reply(req) {
    // req.body.events =
    // [
    //     {
    //         type: "message" | "join" | "memberJoined",
    //         message: {
    //             type: "text",
    //             id: String,
    //             quotedMessageId: String,
    //             quoteToken: String,
    //             text: String,
    //         },
    //         webhookEventId: String,
    //         deliveryContext: {
    //              isRedelivery: Boolean
    //         },
    //         timestamp: 1702262272333,
    //         source: {
    //              type: "user" | "group" | "room",
    //              userId: String
    //         },
    //         replyToken: String,
    //         mode: "active",
    //     },
    // ];
    console.log("events", req.body.events);

    // 只需要 active 的 event
    req.body.events = req.body.events.filter(event => event?.mode === "active");

    return [...JoinMessage(req), ...CommandMessage(req)];
}

module.exports = reply;


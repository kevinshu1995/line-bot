const JoinMessage = require("./events/join");
const CommandMessage = require("./events/command");
const MemberJoinedMessage = require("./events/memberJoined");

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
    // .       // joined 只有 type: "memberJoined" 才會有
    //         "joined": {
    //             "members": [
    //               {
    //                 "type": "user",
    //                 "userId": "U4af4980629..."
    //               },
    //               {
    //                 "type": "user",
    //                 "userId": "U91eeaf62d9..."
    //               }
    //             ]
    //           }
    //     },
    // ];
    // 只需要 active 的 event
    req.body.events = req.body.events.filter(event => event?.mode === "active");
    console.log("events", req.body.events, "\n");

    return [...JoinMessage(req), ...CommandMessage(req), ...MemberJoinedMessage(req)];
}

module.exports = reply;


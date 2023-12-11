const { sendMessage, getUserProfile } = require("../api/line-bot");

const commandOnly = {
    "!": {
        prefix: "!",
        commands: {
            hello: {
                description: "打招呼",
                reply: "你還要我怎樣？",
            },
        },
    },
    "?": {
        prefix: "?",
        commands: {
            help: {
                description: "幫助",
                reply: "我是個指令機器人，你可以輸入 ?commands 來查看指令列表",
            },
            commands: {
                description: "指令列表",
                reply() {
                    const allCommandAry = Object.keys(commandOnly)
                        .map(prefix => {
                            return Object.keys(commandOnly[prefix].commands)
                                .map(command => {
                                    return `${prefix}${command}: ${commandOnly[prefix].commands[command].description}`;
                                })
                                .join("\n");
                        })
                        .join("\n");

                    return "指令列表 \n" + allCommandAry;
                },
            },
        },
    },
};

function getReplyMessage(message) {
    const userFirstLetter = message[0];
    if (commandOnly[userFirstLetter] === undefined) return null;

    const commandText = message.split(" ")[0].substring(1);
    const replyText = commandOnly[userFirstLetter].commands[commandText]?.reply;

    if (replyText === undefined) return null;

    if (typeof replyText === "function") {
        return replyText();
    }
    return replyText;
}

function replyCommandOnly(req) {
    // [
    //     {
    //         type: "message",
    //         message: {
    //             type: "text",
    //             id: String,
    //             quotedMessageId: String,
    //             quoteToken: String,
    //             text: String,
    //         },
    //         webhookEventId: String,
    //         deliveryContext: { isRedelivery: Boolean },
    //         timestamp: 1702262272333,
    //         source: { type: "user", userId: String },
    //         replyToken: String,
    //         mode: "active",
    //     },
    // ];
    console.log("events", req.body.events);
    return req.body.events
        .filter(event => event.type === "message" && event.mode === "active")
        .filter(event => {
            return event.message.type === "text" && event.source.type === "user";
        })
        .map(async event => {
            const userMessage = event.message.text;
            const replyNothing = {
                data: {
                    message: "Nothing to reply",
                    source: event.source,
                    userMessage,
                },
                error: null,
                status: 204,
            };

            const userProfile = await getUserProfile(event.source.userId);
            console.log({ userProfile });

            const reply = getReplyMessage(userMessage);
            if (reply === null) {
                return replyNothing;
            }

            return sendMessage(
                [
                    {
                        type: "text",
                        text: reply,
                    },
                ],
                { replyToken: event.replyToken }
            );
        });
}

module.exports = { replyCommandOnly };


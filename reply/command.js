const { sendMessage } = require("../api/line-bot");

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
    return req.body.events
        .filter(event => event.type === "message" && event.mode === "active")
        .filter(event => {
            return event.message.type === "text";
        })
        .map(event => {
            const userMessage = event.message.text;
            const reply = getReplyMessage(userMessage);

            if (reply === null)
                return {
                    status: 200,
                    data: {
                        message: "Nothing to reply",
                        userMessage,
                    },
                };

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


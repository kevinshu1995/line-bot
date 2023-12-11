const commands = {
    "!": {
        prefix: "!",
        commands: {
            profile: {
                description: "取得個人資料",
                flexMessage() {
                    return {
                        altText: "profile",
                        contents: {
                            type: "bubble",
                            hero: {
                                type: "image",
                                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png",
                                size: "full",
                                aspectRatio: "20:13",
                                aspectMode: "cover",
                                action: {
                                    type: "uri",
                                    uri: "https://linecorp.com",
                                },
                            },
                            body: {
                                type: "box",
                                layout: "vertical",
                                spacing: "md",
                                action: {
                                    type: "uri",
                                    uri: "https://linecorp.com",
                                },
                                contents: [
                                    {
                                        type: "text",
                                        text: "Brown's Burger",
                                        size: "xl",
                                        weight: "bold",
                                    },
                                    {
                                        type: "box",
                                        layout: "vertical",
                                        spacing: "sm",
                                        contents: [
                                            {
                                                type: "box",
                                                layout: "baseline",
                                                contents: [
                                                    {
                                                        type: "icon",
                                                        url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/restaurant_regular_32.png",
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "$10.5",
                                                        weight: "bold",
                                                        margin: "sm",
                                                        flex: 0,
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "400kcl",
                                                        size: "sm",
                                                        align: "end",
                                                        color: "#aaaaaa",
                                                    },
                                                ],
                                            },
                                            {
                                                type: "box",
                                                layout: "baseline",
                                                contents: [
                                                    {
                                                        type: "icon",
                                                        url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/restaurant_large_32.png",
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "$15.5",
                                                        weight: "bold",
                                                        margin: "sm",
                                                        flex: 0,
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "550kcl",
                                                        size: "sm",
                                                        align: "end",
                                                        color: "#aaaaaa",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        type: "text",
                                        text: "Sauce, Onions, Pickles, Lettuce & Cheese",
                                        wrap: true,
                                        color: "#aaaaaa",
                                        size: "xxs",
                                    },
                                ],
                            },
                            footer: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "button",
                                        style: "primary",
                                        color: "#905c44",
                                        margin: "xxl",
                                        action: {
                                            type: "uri",
                                            label: "Add to Cart",
                                            uri: "https://linecorp.com",
                                        },
                                    },
                                ],
                            },
                        },
                    };
                },
                reply() {
                    return null;
                },
            },
            roll: {
                description: "擲一個六面骰子",
                reply() {
                    const diceNum = Math.floor(Math.random() * 6) + 1;
                    return `你擲出了 ${diceNum} 點`;
                },
            },
            hello: {
                description: "打招呼",
                reply() {
                    return "你還要我怎樣？";
                },
            },
        },
    },
    "?": {
        prefix: "?",
        commands: {
            help: {
                description: "幫助",
                reply() {
                    return "我是個指令機器人，你可以輸入 ?commands 來查看指令列表";
                },
            },
            commands: {
                description: "指令列表",
                reply() {
                    const allCommandAry = Object.keys(commands)
                        .map(prefix => {
                            return Object.keys(commands[prefix].commands)
                                .map(command => {
                                    return `${prefix}${command}: ${commands[prefix].commands[command].description}`;
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

const messages = {
    join: {
        reply() {
            return "你好，" + commands["?"].commands["help"].reply;
        },
    },
    memberJoined: {
        reply({ joinedMembers }) {
            return `歡迎 ${joinedMembers.map(member => member.displayName).join(", ")} 加入！`;
        },
    },
};

/**
 *
 *  @param {String} userMessage
 *  @returns {Null | String}
 */
function getCommandReplyMessage(userMessage, ...replyCallbackArgs) {
    const userFirstLetter = userMessage[0];
    if (commands[userFirstLetter] === undefined) return null;

    const commandText = userMessage.split(" ")[0].substring(1);

    const commandObject = commands[userFirstLetter].commands[commandText];

    const replyText = commandObject?.reply;
    if (replyText && typeof replyText === "function") {
        const replyTextResult = replyText(...replyCallbackArgs);
        if (replyTextResult) return { type: "text", text: replyTextResult };
    }

    const flexMessage = commandObject?.flexMessage;
    if (flexMessage && typeof flexMessage === "function") {
        const flexMessageResult = flexMessage(...replyCallbackArgs);
        if (flexMessageResult) return { type: "flex", ...flexMessageResult };
    }

    return null;
}

module.exports = { commands, messages, getCommandReplyMessage };


const { rollDice } = require("../../model/dice");

module.exports = {
    roll: {
        description: "擲一個六面骰子",
        flexMessage() {
            const diceNum = rollDice(6);

            return {
                altText: "擲骰子",
                contents: {
                    type: "bubble",
                    hero: {
                        type: "image",
                        url: "https://i.giphy.com/ckHAdLU2OmY7knUClD.webp",
                        size: "full",
                        aspectRatio: "20:13",
                        aspectMode: "cover",
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
                                text: "擲骰子",
                                size: "xl",
                                weight: "bold",
                            },
                            {
                                type: "box",
                                layout: "vertical",
                                spacing: "sm",
                                contents: [
                                    {
                                        type: "text",
                                        text: `你擲出了 ${diceNum} 點`,
                                        size: "sm",
                                    },
                                ],
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
                                    type: "postback",
                                    label: "再擲一次",
                                    data: "command=!roll",
                                    displayText: "Roll dice again!",
                                },
                            },
                        ],
                    },
                },
            };
        },
    },
};


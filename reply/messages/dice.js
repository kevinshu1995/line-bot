import ModelDice from "../../model/dice.js";
import { DICE_MIN_TYPE, DICE_MAX_TYPE } from "../../api/supabase/roll_dice.js";

const getPostbackData = ({ guessPointsArray, diceCounts, diceType }) => {
    return `command=!roll;${diceType}-${diceCounts}-(${guessPointsArray.reduce((all, point) => {
        if (all === "") return `${point}`;
        return all + "," + point;
    }, "")})`;
};

const guessDiceFlexMessage = () => {
    const diceCounts = 1;
    const diceType = 6;
    const postbackBtnMessage = guessingPoint => `我要預測 ${guessingPoint} 點`;
    return {
        type: "bubble",
        hero: {
            type: "image",
            url: "https://i.imgur.com/LrnGnoT.jpeg",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "擲一顆六面骰子",
                    weight: "bold",
                    size: "xl",
                    margin: "none",
                    wrap: true,
                },
                {
                    type: "text",
                    text: "請選擇下方按鈕預測點數",
                    size: "md",
                    margin: "xs",
                    wrap: true,
                    style: "italic",
                },
                {
                    type: "text",
                    color: "#777777",
                    size: "xs",
                    margin: "lg",
                    wrap: true,
                    contents: [
                        {
                            type: "span",
                            text: "點選下方點數後即會立刻擲一顆六面骰子，若擲出結果與你預測點數相同，你將會獲得",
                        },
                        {
                            type: "span",
                            text: ' "1" ',
                            weight: "bold",
                        },
                        {
                            type: "span",
                            text: "點經驗值",
                        },
                    ],
                },
            ],
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "不預測",
                                data: `command=!roll;${diceType}-${diceCounts}`,
                                displayText: "我只要擲骰子，不預測",
                            },
                            height: "sm",
                            style: "secondary",
                        },
                    ],
                    spacing: "md",
                },
                {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "1 點",
                                data: getPostbackData({ guessPointsArray: [1], diceCounts, diceType }),
                                displayText: postbackBtnMessage(1),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "2 點",
                                data: getPostbackData({ guessPointsArray: [2], diceCounts, diceType }),
                                displayText: postbackBtnMessage(2),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "3 點",
                                data: getPostbackData({ guessPointsArray: [3], diceCounts, diceType }),
                                displayText: postbackBtnMessage(3),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                    ],
                    spacing: "md",
                },
                {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "4 點",
                                data: getPostbackData({ guessPointsArray: [4], diceCounts, diceType }),
                                displayText: postbackBtnMessage(4),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "5 點",
                                data: getPostbackData({ guessPointsArray: [5], diceCounts, diceType }),
                                displayText: postbackBtnMessage(5),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                        {
                            type: "button",
                            action: {
                                type: "postback",
                                label: "6 點",
                                data: getPostbackData({ guessPointsArray: [6], diceCounts, diceType }),
                                displayText: postbackBtnMessage(6),
                            },
                            height: "sm",
                            style: "secondary",
                        },
                    ],
                    spacing: "md",
                    margin: "md",
                },
            ],
            flex: 0,
        },
    };
};

export default {
    rollguess: {
        description: "預測點數，並擲一顆六面骰子 (介面版)",
        flexMessage(event) {
            return { altText: "預測點數，並擲一顆六面骰子 (介面版)", contents: guessDiceFlexMessage() };
        },
    },
    roll: {
        description:
            "預測點數，並擲骰子 (文字版)。格式：`!roll;{骰子類型}-{骰子數}-(預測點數)` 。例如輸入： `!roll;6-2-(1,2)` ，表示擲 [2] 顆 [6] 面骰子，並預測點數為 1, 2 (預測點數數量必須要與骰子數相同)",
        async mix(event, diceType, diceCounts, guessPointsArray) {
            const userId = event.source.userId;
            const { rollDice, guessAndRollDice, getUserAllRollingResults, getUserData } = ModelDice(userId);
            const { data: dataGetUser, error: errorGetUser } = await getUserData();

            diceCounts = Number(diceCounts);
            diceType = Number(diceType);

            const sampleText = "請參考範例: `!roll;6-2-(1,2)`，此例子表示擲 [2] 顆 [6] 面骰子，並預測點數為 1, 2 (預測點數數量必須要與骰子數相同)";
            const diceTypeTooSmallText = `指令錯誤，骰子面數必須大於等於 ${DICE_MIN_TYPE}，您所設定的值為: ${diceType}`;
            const diceTypeTooLargeText = `指令錯誤，骰子面數必須小於等於 ${DICE_MAX_TYPE}，您所設定的值為: ${diceType}`;

            if (Number.isNaN(diceCounts)) {
                return [{ type: "text", text: `指令錯誤，骰子數量必須為數字，目前的值為: ${diceCounts} \n${sampleText}` }];
            }

            if (Number.isNaN(diceType)) {
                return [{ type: "text", text: `指令錯誤，骰子面數必須為數字，目前的值為: ${diceType} \n${sampleText}` }];
            }

            if (guessPointsArray !== undefined && !Array.isArray(guessPointsArray)) {
                return [{ type: "text", text: `指令錯誤，預測點數必須被圓括號包圍 \n${sampleText}` }];
            }

            const isGuessing = Array.isArray(guessPointsArray);
            const diceMethod = isGuessing ? guessAndRollDice : rollDice;
            const diceOption = { dice_counts: diceCounts, user_guesses: guessPointsArray ?? null, dice_type: diceType };

            const { data, error, status, code } = await diceMethod(diceOption);

            // handle error
            if (error) {
                if (status === 400) {
                    if (code === "DICE_TYPE_TOO_SMALL") {
                        return [{ type: "text", text: diceTypeTooSmallText }];
                    }
                    if (code === "DICE_TYPE_TOO_LARGE") {
                        return [{ type: "text", text: diceTypeTooLargeText }];
                    }
                    return [{ type: "text", text: `指令錯誤 \nerror code: ${code}` }];
                }
                if (status === 404) {
                    return [{ type: "text", text: `發生錯誤，找不到使用者 \nerror code: ${code}` }];
                }
                return [{ type: "text", text: `發生錯誤， \nerror code: ${code}` }];
            }

            let dataUserAllRollingResults = null;
            if (dataGetUser?.id) {
                const response = await getUserAllRollingResults(dataGetUser?.id ?? null);
                console.log("getUserAllRollingResults \n", response);
                dataUserAllRollingResults = response.data;
            }
            const allCorrect = dataUserAllRollingResults?.allCorrect;
            const wrongCounts = dataUserAllRollingResults?.totalGuessCount - dataUserAllRollingResults?.allCorrect;
            const successRate = `${Math.floor((dataUserAllRollingResults?.allCorrect / dataUserAllRollingResults?.totalGuessCount) * 100000) / 1000}%`;

            const basicReply = [
                dataGetUser?.line_display_name ? `Hi ${dataGetUser?.line_display_name}!` : "Hi!",
                `你擲 ${data.dice_counts} 顆 ${data.dice_type} 面骰子，擲出了 「${data.dice_results.join(",")}」`,
                isGuessing ? `預測點數為 「${data.user_guesses}」` : "",
                isGuessing ? `【 預測${data.wrong === 0 ? "成功" : "失敗"} 】` : "",
                "---",
                dataUserAllRollingResults?.allCorrect ? `預測成功 ${allCorrect} 次，預測失敗 ${wrongCounts} 次，成功率：${successRate}` : "",
            ]
                .filter(t => t)
                .join("\n");

            if (errorGetUser) {
                return [
                    { type: "text", text: basicReply },
                    { type: "text", text: "[提醒] 你尚未註冊，輸入 `!register` 進行註冊，即可紀錄預測結果" },
                ];
            }

            return [{ type: "text", text: basicReply }];
        },
    },
};


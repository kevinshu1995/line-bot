import ModelUser from "./../../model/user.js";
import ModelDice from "./../../model/dice.js";
import ApiLineBot from "./../../api/line-bot.js";
import dayjs from "./../../lib/dayjs/index.js";

export default {
    profile: {
        description: "取得我的個人資訊",
        async mix(event) {
            const userId = event.source.userId;
            const modelUser = ModelUser(userId);
            const { data: dataFetchUser, error: errorFetchUser, status: statusFetchUser } = await modelUser.fetchDBUser();

            if (errorFetchUser) {
                if (statusFetchUser === 404) {
                    return [{ type: "text", text: "你還沒註冊個人資料喔，請輸入 !register 來註冊" }];
                }
                return [{ type: "text", text: "很抱歉，取得個人資料時發生錯誤，請稍後再試" }];
            }

            const modelDice = ModelDice({ modelUser });
            const { data: dataGetUserRollingResult, error: errorGetUserRollingResult } = await modelDice.getUserAllRollingResults();

            let rollDiceSections = [];
            if (dataGetUserRollingResult) {
                // no need to send dice statistics
                rollDiceSections = [
                    {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "text",
                                text: "骰子",
                                weight: "bold",
                            },
                            {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "box",
                                        layout: "horizontal",
                                        contents: [
                                            {
                                                type: "text",
                                                text: "預測成功：",
                                                contents: [],
                                                color: "#555555",
                                                size: "sm",
                                            },
                                            {
                                                type: "text",
                                                text: `${dataGetUserRollingResult.totalCorrectCounts} 次`,
                                                align: "end",
                                                color: "#111111",
                                                size: "sm",
                                                weight: "bold",
                                            },
                                        ],
                                    },
                                    {
                                        type: "box",
                                        layout: "horizontal",
                                        contents: [
                                            {
                                                type: "text",
                                                text: "預測失敗：",
                                                contents: [],
                                                color: "#555555",
                                                size: "sm",
                                            },
                                            {
                                                type: "text",
                                                text: `${dataGetUserRollingResult.totalWrongCounts} 次`,
                                                align: "end",
                                                color: "#111111",
                                                size: "sm",
                                                weight: "bold",
                                            },
                                        ],
                                    },
                                    {
                                        type: "box",
                                        layout: "horizontal",
                                        contents: [
                                            {
                                                type: "text",
                                                text: "成功率：",
                                                contents: [],
                                                color: "#555555",
                                                size: "sm",
                                            },
                                            {
                                                type: "text",
                                                text: dataGetUserRollingResult.successRate,
                                                align: "end",
                                                color: "#111111",
                                                size: "sm",
                                                weight: "bold",
                                            },
                                        ],
                                    },
                                ],
                                spacing: "sm",
                            },
                        ],
                        paddingAll: "20px",
                        spacing: "lg",
                    },
                    {
                        type: "separator",
                    },
                ];
            }

            console.log("dataFetchUser.created_at", dataFetchUser.created_at);

            const contents = {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "image",
                                    url: "https://i.imgur.com/Ov6bDsl.jpg", // deer img
                                    size: "full",
                                    aspectRatio: "1:1",
                                    gravity: "center",
                                    flex: 1,
                                    align: "center",
                                    aspectMode: "cover",
                                },
                            ],
                        },
                        ...rollDiceSections,
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "image",
                                            url: dataFetchUser.line_picture_url,
                                            aspectMode: "cover",
                                            size: "full",
                                        },
                                    ],
                                    cornerRadius: "100px",
                                    width: "72px",
                                    height: "72px",
                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            contents: [
                                                {
                                                    type: "span",
                                                    text: dataFetchUser.line_display_name,
                                                    weight: "bold",
                                                    color: "#000000",
                                                },
                                            ],
                                            size: "sm",
                                            wrap: true,
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "text",
                                                    text: "加入時間",
                                                    size: "sm",
                                                    color: "#bcbcbc",
                                                },
                                                {
                                                    type: "text",
                                                    text: dayjs(dataFetchUser.created_at).tz("Asia/Taipei").format("YYYY/MM/DD HH:mm Z"),
                                                    size: "sm",
                                                    color: "#bcbcbc",
                                                },
                                            ],
                                            spacing: "none",
                                            margin: "md",
                                        },
                                    ],
                                },
                            ],
                            spacing: "xl",
                            paddingAll: "20px",
                        },
                    ],
                    paddingAll: "0px",
                },
            };

            const extraMessages = [errorGetUserRollingResult ? { type: "text", text: "很抱歉，取得骰子統計資料時發生錯誤，請稍後再試" } : null].filter(Boolean);

            return [{ type: "flex", altText: "取得我的個人資訊", contents }, ...extraMessages];
        },
    },

    register: {
        description: "註冊個人資料",
        async reply(event) {
            const userId = event.source.userId;

            const { data: dataGetUserProfile, error: errorGetUserProfile } = await ApiLineBot.getUserProfile(userId);

            if (errorGetUserProfile) {
                return "很抱歉，取得個人資料時發生錯誤，請稍後再試";
            }

            const { displayName, language, pictureUrl } = dataGetUserProfile;

            const {
                data: dataRegisterDBUser,
                error: errorRegisterDBUser,
                status: statusRegisterDBUser,
            } = await ModelUser(userId).registerDBUser({
                line_display_name: displayName,
                line_language: language,
                line_picture_url: pictureUrl,
            });

            // 200 建立成功, 201 已經建立過, 400 參數錯誤
            if (errorRegisterDBUser) {
                if (statusRegisterDBUser === 400) {
                    return "很抱歉，註冊個人資料時發生錯誤，攻城獅知錯了";
                }
                return "很抱歉，註冊個人資料時發生錯誤，請稍後再試";
            }

            if (statusRegisterDBUser === 201) {
                return `你好，${displayName}，註冊完成，你的註冊時間是 ${dataRegisterDBUser.created_at}`;
            }

            return `你好，${displayName}，你早就註冊完成啦！逃不過我的法眼的`;
        },
    },
};


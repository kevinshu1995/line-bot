import ModelUser from "./../../model/user.js";
import ApiLineBot from "./../../api/line-bot.js";

export default {
    profile: {
        description: "取得我的個人資訊",
        async reply(event) {
            const userId = event.source.userId;
            const { data, error, status } = await ModelUser(userId).fetchDBUser();

            if (error) {
                if (status === 404) {
                    return "你還沒註冊個人資料喔，請輸入 !register 來註冊";
                }
                return "很抱歉，取得個人資料時發生錯誤，請稍後再試";
            }

            // ready for flexMessage
            // data.line_display_name
            // data.line_language
            // data.line_picture_url

            return `你好，${data.line_display_name}，你的註冊時間是 ${data.created_at}`;
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
                return `你好，${displayName}，你早就註冊完成啦！逃不過我的法眼的`;
            }

            return `你好，${displayName}，註冊完成，你的註冊時間是 ${dataRegisterDBUser.created_at}`;
        },
    },
};


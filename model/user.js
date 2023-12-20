import ApiSupabase from "../api/supabase/index.js";
import ApiLineBot from "../api/line-bot.js";

export default function User(line_id) {
    const user = {
        id: null,
        line_id,
        line_display_name: null,
        line_language: null,
        line_picture_url: null,
    };

    function setPrivateUser({ line_display_name, line_language, line_picture_url, user_id }) {
        user.id = user_id;
        user.line_display_name = line_display_name;
        user.line_language = line_language;
        user.line_picture_url = line_picture_url;
    }

    async function registerDBUser({ line_display_name, line_language, line_picture_url }) {
        const response = await ApiSupabase.User.setNewUser({ line_id, line_display_name, line_language, line_picture_url });
        // fetch update user
        if (response.error) {
            return {
                ...response,
                code: "REGISTER_DB_USER_ERROR",
            };
        }

        setPrivateUser({
            user_id: response.data.id,
            line_display_name: response.data.line_display_name,
            line_language: response.data.line_language,
            line_picture_url: response.data.line_picture_url,
        });

        return response;
    }

    async function updateDBUser({ line_display_name, line_language, line_picture_url }) {
        const response = await ApiSupabase.User.updateUserByLineId(line_id, { line_display_name, line_language, line_picture_url });
        if (response.error) {
            return {
                ...response,
                code: "UPDATE_DB_USER_ERROR",
            };
        }

        setPrivateUser({
            user_id: response.data.id,
            line_display_name: response.data.line_display_name,
            line_language: response.data.line_language,
            line_picture_url: response.data.line_picture_url,
        });

        return response;
    }

    async function fetchDBUser() {
        // fetch user with line_id
        const response = await ApiSupabase.User.getOneUserByLineId(line_id);
        if (response.error) {
            return {
                ...response,
                code: "GET_DB_USER_ERROR",
            };
        }

        setPrivateUser({
            user_id: response.data.id,
            line_display_name: response.data.line_display_name,
            line_language: response.data.line_language,
            line_picture_url: response.data.line_picture_url,
        });

        return response;
    }

    // async user with line_id
    // 使用者必須先註冊到資料庫才能使用
    async function asyncUser() {
        const { data: dataGetUserProfile, error: errorGetUserProfile, status: statusGetUserProfile } = await ApiLineBot.getUserProfile(line_id);
        if (error) {
            return {
                data: null,
                error: errorGetUserProfile,
                status: statusGetUserProfile,
                code: "GET_USER_PROFILE_ERROR",
            };
        }

        const userDataForApi = {
            line_display_name: dataGetUserProfile.displayName,
            line_language: dataGetUserProfile.language,
            line_picture_url: dataGetUserProfile.pictureUrl,
        };

        const { data: dataUpdateUserByLineId, error: errorUpdateUserByLineId, status: statusUpdateUserByLineId } = await ApiSupabase.User.updateUserByLineId(line_id, userDataForApi);

        if (errorUpdateUserByLineId) {
            return { data: dataUpdateUserByLineId, error: errorUpdateUserByLineId, status: statusUpdateUserByLineId, code: "UPDATE_DB_USER_ERROR" };
        }

        setPrivateUser({
            user_id: response.data.id,
            line_display_name: data.displayName,
            line_language: data.language,
            line_picture_url: data.pictureUrl,
        });

        return { data: dataUpdateUserByLineId, error: errorUpdateUserByLineId, status: statusUpdateUserByLineId, code: "SUCCESS" };
    }

    // getter
    function getUser() {
        return user;
    }

    return {
        asyncUser,
        fetchDBUser,
        registerDBUser,
        updateDBUser,
        getUser,
    };
}


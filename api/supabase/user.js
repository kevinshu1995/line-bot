import Supabase from "./supabase.js";

const { clientServiceRole } = Supabase;
const userTable = "user";

/**
 *  @typedef {Object} User
 *  @property {string} id
 *  @property {string} line_id
 *  @property {string} line_display_name
 *  @property {string} line_language
 *  @property {string} line_picture_url
 */

export async function getAllUsers() {
    const res = await clientServiceRole.from(userTable).select("*");
    return res;
}

export async function getOneUserByLineId(line_id) {
    // check if user already exists
    const { data, error, ...rest } = await clientServiceRole.from(userTable).select().eq("line_id", line_id);

    if (error) {
        console.error("[supabase getOneUserByLineId] failed. response: \n", { data, error, ...rest });
    }

    if (data.length === 0) {
        const response = {
            ...rest,
            data: null,
            error: new Error("User not found"),
            status: 404,
            statusText: "Not Found",
        };
        console.error("[supabase setNewUser] failed. response: \n", response);
        return response;
    }

    return { data: data[0] ?? null, error, ...rest };
}

/**
 *  @typedef {Object} NewUserData
 *  @property {string} line_id
 *  @property {string} line_display_name
 *  @property {string} line_language
 *  @property {string} line_picture_url
 */
/**
 *  generate new user
 *  @param {NewUserData} NewUserData
 *  @returns {Promise<{
 *      data: User,
 *      error: Error,
 *      status: 200|201|400 // (201 建立成功, 200 已經建立過, 400 參數錯誤)
 *  }>}
 */
export async function setNewUser(NewUserData = {}) {
    const { line_id, line_display_name, line_language, line_picture_url } = { line_id: null, line_display_name: null, line_language: null, line_picture_url: null, ...(NewUserData || {}) };
    if (!line_id || !line_display_name || !line_language || !line_picture_url) {
        const response = {
            data: null,
            error: new Error(
                "Missing required fields: " +
                    (!line_id ? " line_id" : "") +
                    (!line_display_name ? " line_display_name" : "") +
                    (!line_language ? " line_language" : "") +
                    (!line_picture_url ? " line_picture_url" : "")
            ),
            status: 400,
            statusText: "Bad Request",
        };
        console.error("[supabase setNewUser] failed. response: \n", response);

        return response;
    }

    const responseGetOneUserByLineId = await getOneUserByLineId(line_id);

    // 找不到代表沒有建立過
    if (responseGetOneUserByLineId.status !== 404) {
        if (responseGetOneUserByLineId.error) {
            return responseGetOneUserByLineId;
        }

        if (responseGetOneUserByLineId.data) {
            console.warn("[supabase setNewUser] this user already exists. responseGetOneUserByLineId: \n", responseGetOneUserByLineId);
            return {
                ...responseGetOneUserByLineId,
                status: 200,
            };
        }
    }

    const responseCreateNewUser = await clientServiceRole.from(userTable).insert({ line_id, line_display_name, line_language, line_picture_url }).select();
    const response = {
        ...responseCreateNewUser,
        data: responseCreateNewUser.data?.[0] ?? null,
    };

    console.log("[supabase setNewUser] responseCreateNewUser: \n", response);

    return response;
}

/**
 *  @typedef {Object} UpdateUserDataOptions
 *  @property {string} line_display_name
 *  @property {string} line_language
 *  @property {string} line_picture_url
 */
/**
 *  update specific User with line_id
 *  @param {string} line_id
 *  @param {UpdateUserDataOptions} NewUserData
 *  @returns {Promise<{
 *      data: User,
 *      error: Error,
 *      status: 200|400 // (200 修改成功 (不管是不是真的有修改), 400 參數錯誤)
 *  }>}
 */
export async function updateUserByLineId(line_id = null, NewUserData = {}) {
    const { line_display_name, line_language, line_picture_url } = { line_display_name: null, line_language: null, line_picture_url: null, ...(NewUserData || {}) };
    if (!line_id || !line_display_name || !line_language || !line_picture_url) {
        const response = {
            data: null,
            error: new Error(
                "Missing required fields: " +
                    (!line_id ? " line_id" : "") +
                    (!line_display_name ? " line_display_name" : "") +
                    (!line_language ? " line_language" : "") +
                    (!line_picture_url ? " line_picture_url" : "")
            ),
            status: 400,
            statusText: "Bad Request",
        };
        console.error("[supabase setNewUser] failed. response: \n", response);

        return response;
    }

    const responseUpdateUserByLineId = await clientServiceRole.from(userTable).update({ line_display_name, line_language, line_picture_url }).eq("line_id", line_id).select();

    const response = {
        ...responseUpdateUserByLineId,
        data: responseUpdateUserByLineId.data?.[0] ?? null,
    };

    console.log("[supabase updateUserByLineId] response: ", response);

    return response;
}


import Supabase from "./supabase.js";
import { guessAndRollDices, rollMultiDices, compareGuessAndRollDice } from "./../../model/dice.js";
import { getOneUserByLineId } from "./user.js";

const { clientServiceRole } = Supabase;
const rollDiceTable = "roll_dice";

export const DICE_MIN_TYPE = 4;
export const DICE_MAX_TYPE = 20;

const badRequestResponse = options => {
    return {
        data: null,
        error: new Error(options?.errorMsg ?? ""),
        status: 400,
        code: options?.code ?? "Bad Request",
    };
};

/**
 *  @typedef {Object} RollDice
 *  @property {Number} dice_counts // 骰子數量
 *  @property {Number[]} dice_results // 骰子點數
 *  @property {User.id | null} user_id // option 使用者 public.user.id
 *  @property {Number[] | null} user_guesses  // option 使用者猜的點數
 *  @property {Number} dice_type  // option 幾面的骰子
 */

/**
 *  @typedef {Object} OptionsGetUserAllRollingResults
 *  @property {string} line_user_id // line user id
 */
/**
 *
 *  @param {OptionsGetUserAllRollingResults} options
 *  @returns {
 *      Promise<{
 *          data: {
 *              data: RollDice[],
 *              wrong: Number,
 *              correct: Number,
 *              allCorrect: Number,
 *          },
 *          error: Error,
 *          status: 200 | 400 | 404 // (200 成功, 400 參數錯誤, 404 找不到使用者)
 *          code: 'Bad Request' | 'USER_ID_REQUIRED',
 *      }>
 *  }
 */
export async function getUserAllRollingResults(options = {}) {
    let { line_user_id, user_id } = { line_user_id: null, user_id: null, ...options };
    async function main() {
        if (!line_user_id && !user_id) {
            return badRequestResponse({ errorMsg: "Either line_user_id or user_id should contain a value.", code: "LINE_USER_ID_AND_USER_ID_REQUIRED" });
        }

        if (!user_id) {
            const responseGetUser = await getOneUserByLineId(line_user_id);

            if (responseGetUser.error) {
                console.error("[supabase getUserAllRollingResults] getOneUserByLineId failed. response: \n", responseGetUser);
                return {
                    ...responseGetUser,
                    code: "GET_USER_BY_LINE_ID_ERROR",
                };
            }
            user_id = responseGetUser.data.id;
        }

        const response = await clientServiceRole.from(rollDiceTable).select().eq("user_id", user_id);

        if (response.error) {
            console.error("[supabase getUserAllRollingResults] failed. response: \n", response);
        }

        const correctAndWrong = response.data.reduce(
            (all, rollDiceData) => {
                if (!rollDiceData.user_guesses || !rollDiceData.dice_results) return all;
                const { wrong, correct } = compareGuessAndRollDice(rollDiceData.dice_results, rollDiceData.user_guesses);
                const isAllCorrect = wrong === 0 && correct === rollDiceData.user_guesses.length;

                return {
                    wrong: all.wrong + wrong,
                    correct: all.correct + correct,
                    allCorrect: isAllCorrect ? all.allCorrect + 1 : all.allCorrect,
                };
            },
            {
                wrong: 0,
                correct: 0,
                allCorrect: 0,
            }
        );

        response.data = {
            data: response.data,
            ...correctAndWrong,
        };

        return {
            ...response,
            code: "OK",
        };
    }

    const response = await main();

    if (response.error) {
        console.error("[getUserAllRollingResults response] \n", response);
    } else {
        console.log("[getUserAllRollingResults response] \n", response);
        console.log("[getUserAllRollingResults data] \n", JSON.stringify(response.data, null, 4));
    }
    return response;
}

/**
 * 擲骰子並回傳結果。
 *
 *  @param {Object} params - 擲骰子的參數。
 *  @param {number} params.dice_counts - 要擲出的骰子數量。 // required
 *  @param {number} params.line_user_id - 使用者 line user id。  // optional
 *  @param {Array<number>} params.user_guesses - 使用者的猜測結果。 // optional
 *  @param {number} params.dice_type - 骰子的面數，預設為 6。 // optional
 *  @returns {
 *      Promise<{
 *          data: {
 *              ...RollDice,
 *              wrong?: Number,
 *              correct?: Number,
 *          },
 *          error: Error,
 *          status: 201 | 400 | 404 // (201 成功, 400 參數錯誤, 404 找不到使用者)
 *          code: 'OK' | 'Bad Request' | 'DICE_COUNTS_REQUIRED' | 'DICE_COUNTS_NOT_NUMBER' | 'USER_GUESSES_TYPE_WRONG' | 'DICE_TYPE_NOT_NUMBER' | 'DICE_TYPE_TOO_SMALL' | 'DICE_TYPE_TOO_LARGE' | 'USER_GUESSES_LENGTH_NOT_MATCH_WITH_DICE_COUNTS' | 'USER_GUESSES_INCLUDE_NOT_NUMBER' | 'USER_GUESSES_INCLUDE_WRONG_POINT',
 *      }>
 *  } 回傳一個 Promise，其解析為包含擲骰子結果的物件。
 */
export async function rollDice({ dice_counts = null, line_user_id = null, user_id = null, user_guesses = null, dice_type = 6 }) {
    async function main() {
        // dev fault
        if (dice_counts === null) {
            return badRequestResponse({ errorMsg: "dice_counts is required", code: "DICE_COUNTS_REQUIRED" });
        }
        if (typeof dice_counts !== "number") {
            return badRequestResponse({ errorMsg: "dice_counts must be a number", code: "DICE_COUNTS_NOT_NUMBER" });
        }
        if (Array.isArray(user_guesses) === false && user_guesses !== null) {
            return badRequestResponse({ errorMsg: "user_guesses must be an array or null value", code: "USER_GUESSES_TYPE_WRONG" });
        }
        if (typeof dice_type !== "number") {
            return badRequestResponse({ errorMsg: "dice_type must be a number", code: "DICE_TYPE_NOT_NUMBER" });
        }
        if (dice_type < DICE_MIN_TYPE) {
            return badRequestResponse({ errorMsg: "dice_type must be greater than " + (DICE_MIN_TYPE - 1), code: "DICE_TYPE_TOO_SMALL" });
        }
        if (dice_type > DICE_MAX_TYPE) {
            return badRequestResponse({ errorMsg: "dice_type must be less than " + (DICE_MAX_TYPE + 1), code: "DICE_TYPE_TOO_LARGE" });
        }

        // user is GUESSING
        if (user_guesses !== null) {
            // user fault
            if (user_guesses.length !== dice_counts) {
                return badRequestResponse({ errorMsg: "user_guesses length must be equal to dice_counts", code: "USER_GUESSES_LENGTH_NOT_MATCH_WITH_DICE_COUNTS" });
            }
            user_guesses = user_guesses.map(guess => parseInt(guess));

            const isUserGuessOnlyIncludeNumber = user_guesses.every(guess => Number.isNaN(guess) === false);
            if (isUserGuessOnlyIncludeNumber === false) {
                return badRequestResponse({ errorMsg: "user_guesses must be an array of number", code: "USER_GUESSES_INCLUDE_NOT_NUMBER" });
            }

            const isUserGuessWrongRange = user_guesses.some(guess => guess < 1 || guess > dice_type);
            if (isUserGuessWrongRange) {
                return badRequestResponse({ errorMsg: "user_guesses must be in range of " + DICE_MIN_TYPE + " to " + dice_type, code: "USER_GUESSES_INCLUDE_WRONG_POINT" });
            }

            // just roll
            const { diceResults, wrong, correct } = guessAndRollDices(dice_type, user_guesses);
            const insertData = { user_guesses, dice_counts, dice_results: diceResults, dice_type };
            if (user_id) {
                insertData.user_id = user_id;
            } else if (line_user_id) {
                const responseGetUser = await getOneUserByLineId(line_user_id);

                if (responseGetUser.error) {
                    console.error("[supabase getUserAllRollingResults] getOneUserByLineId failed. response: \n", responseGetUser);
                    return {
                        ...responseGetUser,
                        code: "GET_USER_BY_LINE_ID_ERROR",
                    };
                }

                insertData.user_id = responseGetUser.data.id;
            }
            const response = await clientServiceRole.from(rollDiceTable).insert(insertData).select().single();

            if (response.data) {
                response.data = {
                    ...response.data,
                    wrong,
                    correct,
                };
            }
            return {
                ...response,
                code: "OK",
            };
        }
        const result = rollMultiDices(dice_counts, dice_type);
        const insertData = { dice_counts, dice_results: result, dice_type };
        if (user_id) {
            insertData.user_id = user_id;
        } else if (line_user_id) {
            const responseGetUser = await getOneUserByLineId(line_user_id);

            if (responseGetUser.error) {
                console.error("[supabase getUserAllRollingResults] getOneUserByLineId failed. response: \n", responseGetUser);
                return {
                    ...responseGetUser,
                    code: "GET_USER_BY_LINE_ID_ERROR",
                };
            }

            insertData.user_id = responseGetUser.data.id;
        }
        const rollDiceResponse = await clientServiceRole.from(rollDiceTable).insert(insertData).select().single();

        if (rollDiceResponse.error) {
            return {
                ...rollDiceResponse,
                code: rollDiceResponse.statusText,
            };
        }

        let userRollingResultsResponse = null;
        if (insertData?.user_id) {
            userRollingResultsResponse = getUserAllRollingResults({ user_id: insertData.user_id });
            if (userRollingResultsResponse.error) {
                return {
                    ...rollDiceResponse,
                    error: userRollingResultsResponse.error,
                    code: userRollingResultsResponse.statusText,
                };
            }
        }

        return {
            ...rollDiceResponse,
            data: {
                ...rollDiceResponse.data,
                allCorrect: userRollingResultsResponse?.data?.allCorrect ?? null,
            },
            code: "OK",
        };
    }

    const response = await main();

    if (response.error) {
        console.error("[rollDice response] \n", response);
    } else {
        console.log("[rollDice response] \n", response);
    }
    return response;
}

// rollDice({ dice_counts: 3, line_user_id: "U2a0a2c5054c4fa12b78a1d059411e39c", dice_type: 6 });
// getUserAllRollingResults({ line_user_id: "U2a0a2c5054c4fa12b78a1d059411e39c" });


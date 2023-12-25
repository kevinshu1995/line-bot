import ApiSupabase from "../api/supabase/index.js";
import ModelUser from "./user.js";

/**
 *  擲一個 [diceType] 面骰子
 *  @param {Number} diceType (default: 6) 骰子面數
 *
 *  @return {Number} 回傳骰子點數
 */
export function rollDice(diceType = 6) {
    return Math.floor(Math.random() * diceType) + 1;
}

/**
 *
 *  擲 [diceNum] 個 [diceType] 面骰子
 *  @param {Number} diceNum (default: 1) 骰子數量
 *  @param {Number} diceType (default: 6) 骰子面數
 *
 *  @return {Number[]} 回傳骰子點數陣列
 */
export function rollMultiDices(diceNum = 1, diceType = 6) {
    let result = [];
    for (let i = 0; i < diceNum; i++) {
        result.push(rollDice(diceType));
    }
    return result;
}

export function compareGuessAndRollDice(diceResults = null, userGuesses = null) {
    const diceResultsCopy = [...diceResults];
    return userGuesses.reduce(
        (acc, guess) => {
            const index = diceResultsCopy.indexOf(guess);
            if (index !== -1) {
                acc.correct++;
                diceResultsCopy.splice(index, 1); // remove the number from diceResults
            } else {
                acc.wrong++;
            }
            return acc;
        },
        { wrong: 0, correct: 0 }
    );
}

// 不管 userGuesses 是不是在 diceType 的範圍內，都會回傳
export function guessAndRollDices(diceType = 6, userGuesses = []) {
    const diceResults = rollMultiDices(userGuesses.length, diceType);
    const { wrong, correct } = compareGuessAndRollDice(diceResults, userGuesses);

    return { diceResults, wrong, correct };
}

export default function Dice(options = {}) {
    const { lineUserId, modelUser } = { lineUserId: null, modelUser: null, ...options };
    if (!lineUserId && !modelUser) throw new Error("Either lineUserId or modelUser must be provided");
    const _modelUser = modelUser ?? ModelUser(lineUserId);

    async function getUserData() {
        const currentUser = _modelUser.getUser();
        if (currentUser.line_display_name) {
            return {
                data: currentUser,
                error: null,
                status: 200,
            };
        }
        const response = await _modelUser.fetchDBUser();
        return response;
    }

    async function rollDice({ dice_counts, dice_type }) {
        const { data } = await getUserData();

        const response = await ApiSupabase.Dice.rollDice({ dice_counts, user_id: data?.id ?? null, dice_type });
        if (response.data) {
            response.data.user = data ?? null;
        }
        return response;
    }

    async function guessAndRollDice({ dice_counts, user_guesses, dice_type }) {
        const { data } = await getUserData();

        const response = await ApiSupabase.Dice.rollDice({ dice_counts, user_id: data?.id ?? null, user_guesses, dice_type });
        if (response.data) {
            response.data.user = data ?? null;
        }
        return response;
    }

    async function getUserAllRollingResults() {
        const { data } = await getUserData();

        const response = await ApiSupabase.Dice.getUserAllRollingResults({ user_id: data?.id ?? null });
        if (response.data) {
            response.data.user = data ?? null;
        }
        return response;
    }

    return {
        rollDice,
        guessAndRollDice,
        getUserAllRollingResults,
        getUserData,
    };
}


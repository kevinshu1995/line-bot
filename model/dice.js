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


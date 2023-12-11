const { sendMessage, getUserProfile, replyNothingMockApiResult } = require("../../api/line-bot");
const { getCommandReplyMessage } = require("../configs");

module.exports = function CommandMessage(req) {
    // reply =========
    // 是否有符合回應格式的訊息
    const validReplyEvents = req.body.events.filter(event => event?.type === "message" && event?.message?.type === "text");

    return validReplyEvents.map(async event => {
        const userMessage = event.message.text;

        const reply = getCommandReplyMessage(userMessage);
        if (reply === null) {
            return replyNothingMockApiResult({ event, message: "no message to reply" });
        }
        // const { data: userProfile, error: userProfileError } = await getUserProfile(event.source.userId);
        // const greeting = userProfile ? `Hello, ${userProfile.displayName} \n` : "";

        return sendMessage([reply], { replyToken: event.replyToken });
    });
};


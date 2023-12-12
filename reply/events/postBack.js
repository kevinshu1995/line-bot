const { sendMessage, replyNothingMockApiResult } = require("../../api/line-bot");
const { getCommandReplyMessage } = require("../configs");

module.exports = function PostBackMessage(req) {
    const validReplyEvents = req.body.events.filter(event => event?.type === "postback");

    return validReplyEvents.map(async event => {
        const data = event.postback?.data || "";
        const dataObj = data.split("&").reduce((acc, cur) => {
            const [key, value] = cur.split("=");
            acc[key] = value;
            return acc;
        }, {});

        if (dataObj.command !== undefined) {
            const reply = getCommandReplyMessage(dataObj.command);
            if (reply === null) {
                return replyNothingMockApiResult({ event, message: "no message to reply" });
            }
        }

        return sendMessage([reply], { replyToken: event.replyToken });
    });
};


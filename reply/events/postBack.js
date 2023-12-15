import LineBot from "../../api/line-bot.js";
import Configs from "../configs.js";

export default function PostBackMessage(req) {
    const validReplyEvents = req.body.events.filter(event => event?.type === "postback");

    return validReplyEvents.map(async event => {
        const data = event.postback?.data || "";
        const dataObj = data.split("&").reduce((acc, cur) => {
            const [key, value] = cur.split("=");
            acc[key] = value;
            return acc;
        }, {});

        if (dataObj.command !== undefined) {
            const reply = Configs.getCommandReplyMessage(dataObj.command, event);
            if (reply === null) {
                return LineBot.replyNothingMockApiResult({ event, message: "no message to reply" });
            }
            return LineBot.sendMessage([reply], { replyToken: event.replyToken });
        }

        return LineBot.replyNothingMockApiResult({ event, message: "no message to reply" });
    });
}


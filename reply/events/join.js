import LineBot from "../../api/line-bot.js";
import Configs from "../configs.js";

export default function JoinMessage(req) {
    // join ==========
    const validJoinEvents = req.body.events.filter(event => event?.type === "join");
    return validJoinEvents.map(event => {
        return LineBot.sendMessage(
            [
                {
                    type: "text",
                    text: Configs.messages.join.reply(event),
                },
            ],
            { replyToken: event.replyToken }
        );
    });
}


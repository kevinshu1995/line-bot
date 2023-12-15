import LineBot from "../../api/line-bot.js";
import Configs from "../configs.js";

export default function MemberJoinedMessage(req) {
    // join ==========
    const validMemberJoinedEvents = req.body.events.filter(event => event?.type === "memberJoined");

    return validMemberJoinedEvents.map(event => {
        const joinedUsers = (event?.joined?.members ?? []).filter(member => member?.type === "user");
        if (joinedUsers.length === 0) {
            return LineBot.replyNothingMockApiResult({ event, message: "no joinedUsers" });
        }
        return LineBot.sendMessage(
            [
                {
                    type: "text",
                    text: Configs.messages.memberJoined.reply(event, { joinedMembers: joinedUsers }),
                },
            ],
            { replyToken: event.replyToken }
        );
    });
}


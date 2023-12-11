const { sendMessage, replyNothingMockApiResult } = require("../api/line-bot");
const { messages } = require("./configs");

module.exports = function JoinMessage(req) {
    // join ==========
    const validMemberJoinedEvents = req.body.events.filter(event => event?.type === "memberJoined");

    return validMemberJoinedEvents.map(event => {
        const joinedUsers = (event?.joined?.members ?? []).filter(member => member?.type === "user");
        if (joinedUsers.length === 0) {
            return replyNothingMockApiResult({ event, message: "no joinedUsers" });
        }
        return sendMessage(
            [
                {
                    type: "text",
                    text: messages.memberJoined.reply({ joinedMembers: joinedUsers }),
                },
            ],
            { replyToken: event.replyToken }
        );
    });
};


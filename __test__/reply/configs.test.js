import Configs from "./../../reply/configs.js";

const command = Configs.commands;

describe("Test getCommandReplyMessage", () => {
    test("when user typed: !hello", () => {
        const userMessage = "!hello";
        const replyMessage = Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["!"].commands.hello.reply(),
            type: "text",
        };

        expect(replyMessage).toMatchObject(expectedReplyMessage);
    });

    test("when user typed: ?help", () => {
        const userMessage = "?help";
        const replyMessage = Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["?"].commands.help.reply(),
            type: "text",
        };

        expect(replyMessage).toMatchObject(expectedReplyMessage);
    });

    test("when user typed: ?commands", () => {
        const userMessage = "?commands";
        const replyMessage = Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["?"].commands.commands.reply(),
            type: "text",
        };

        expect(replyMessage).toMatchObject(expectedReplyMessage);
    });
});


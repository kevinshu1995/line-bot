import Configs from "./../../reply/configs.js";
import LineBot from "./../../api/line-bot.js";

const command = Configs.commands;

describe("Test getCommandReplyMessage return value properly", () => {
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

    test("when user typed: ?xxx (not a defined command)", () => {
        const userMessage = "?xxx";
        const replyMessage = Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = null;

        expect(replyMessage).toBe(expectedReplyMessage);
    });
});

const allCommands = Object.keys(command).reduce((all, prefix) => {
    Object.keys(command[prefix].commands).forEach(commandName => {
        const commandContent = command[prefix].commands[commandName];
        if (commandContent.reply) {
            all.push([`${prefix}${commandName}`, { type: "text", text: commandContent.reply() }]);
        }
        if (commandContent.flexMessage) {
            all.push([`${prefix}${commandName}`, { type: "flex", ...commandContent.flexMessage() }]);
        }
    });
    return all;
}, []);

describe("Test Configs.commands reply & flexMessage structure is valid", () => {
    test.concurrent.each(allCommands)("when user typed: %s", async (command, replyMessage) => {
        const response = await LineBot.validateReply({ messages: [replyMessage] });
        if (response.status !== 200) {
            console.error("validateReply !roll response: \n", response);
        }
        expect(response.status).toBe(200);
    });
});

describe("Test Configs.commands and getCommandReplyMessage together", () => {
    test.concurrent.each(allCommands)("when user typed: %s", async (command, _) => {
        const response = await LineBot.validateReply({ messages: [Configs.getCommandReplyMessage(command)] });
        if (response.status !== 200) {
            console.error("validateReply !roll response: \n", response);
        }
        expect(response.status).toBe(200);
    });
});


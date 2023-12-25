import Configs from "./../../reply/configs.js";
import LineBot from "./../../api/line-bot.js";

const command = Configs.commands;
const customEvent = { source: { userId: "aaa" } };

describe("Test getCommandReplyMessage return value properly", () => {
    test("when user typed: !hello", async () => {
        const userMessage = "!hello";
        const replyMessage = await Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["!"].commands.hello.reply(),
            type: "text",
        };

        expect(replyMessage[0]).toMatchObject(expectedReplyMessage);
    });

    test("when user typed: ?help", async () => {
        const userMessage = "?help";
        const replyMessage = await Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["?"].commands.help.reply(),
            type: "text",
        };

        expect(replyMessage[0]).toMatchObject(expectedReplyMessage);
    });

    test("when user typed: ?commands", async () => {
        const userMessage = "?commands";
        const replyMessage = await Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = {
            text: command["?"].commands.commands.reply(),
            type: "text",
        };

        expect(replyMessage[0]).toMatchObject(expectedReplyMessage);
    });

    test("when user typed: ?xxx (not a defined command)", async () => {
        const userMessage = "?xxx";
        const replyMessage = await Configs.getCommandReplyMessage(userMessage);

        const expectedReplyMessage = null;

        expect(replyMessage).toBe(expectedReplyMessage);
    });
});

const allCommands = Object.keys(command)
    .reduce((all, prefix) => {
        const result = Object.keys(command[prefix].commands).map(commandName => {
            const commandContent = command[prefix].commands[commandName];
            if (commandContent.reply) {
                const fn = async () => {
                    const text = await commandContent.reply(customEvent);
                    return [{ type: "text", text }];
                };
                return [`${prefix}${commandName}`, fn];
            }
            if (commandContent.flexMessage) {
                const fn = async () => {
                    const flexMessage = await commandContent.flexMessage(customEvent);
                    return [{ type: "flex", ...flexMessage }];
                };
                return [`${prefix}${commandName}`, fn];
            }
            if (commandContent.mix) {
                const fn = async () => {
                    const mixMessage = await commandContent.mix(customEvent);
                    return mixMessage;
                };
                return [`${prefix}${commandName}`, fn];
            }
        });
        return all.concat(result);
    }, [])
    .filter(([command, _]) => {
        const skipCommands = ["!profile", "!register"];
        return !skipCommands.includes(command);
    });

describe("Test Configs.commands reply & flexMessage structure is valid", () => {
    test.concurrent.each(allCommands)("when user typed: %s", async (command, fn) => {
        const message = await fn();
        const response = await LineBot.validateReply({ messages: message });
        if (response.status !== 200) {
            console.error("validateReply !roll response: \n", response);
        }
        expect(response.status).toBe(200);
    });
});

describe("Test Configs.commands and getCommandReplyMessage together", () => {
    test.concurrent.each(allCommands)("when user typed: %s", async (command, _) => {
        const message = await Configs.getCommandReplyMessage(command, customEvent);
        const response = await LineBot.validateReply({ messages: message });
        if (response.status !== 200) {
            console.error("validateReply !roll response: \n", response);
        }
        expect(response.status).toBe(200);
    });
});


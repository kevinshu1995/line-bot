module.exports = {
    hello: {
        description: "機器人打招呼",
        reply() {
            return "你還要我怎樣？";
        },
    },
    help: {
        description: "機器人的簡易說明",
        reply() {
            return "我是個指令機器人，你可以輸入 ?commands 來查看指令列表";
        },
    },
    join: {
        description: "這個機器人加入時的打招呼訊息",
        reply() {
            return "大家好～ \n 我是個指令機器人，你可以輸入 ?commands 來查看我的指令列表";
        },
    },
    memberJoined: {
        description: "新成員加入時傳送的歡迎訊息",
        reply({ joinedMembers }) {
            return `歡迎 ${joinedMembers.map(member => member.displayName).join(", ")} 加入！`;
        },
    },
};


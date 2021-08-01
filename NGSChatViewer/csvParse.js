"use strict";
const fs = require("fs");
const csv = require("csvtojson");
const encord = "utf16le"

// CSV Parse (アクションログ)
async function readActionLog(path) {
    const data = fs.readFileSync(path, encord)
    return await csv({
        noheader: true,
        delimiter: "	",
        headers: ["log_time", "action_id", "action_type", "player_id", "player_name", "item_name", "item_num", "current_meseta"]
    }).fromString(data)
}

// CSV Parse (チャットログ)
async function readChatLog(path) {
    const data = fs.readFileSync(path, encord)
    return await csv({
        noheader: true,
        delimiter: "	",
        headers: ["log_time", "chat_id", "send_to", "player_id", "player_name", "content"]
    }).fromString(data)
}

module.exports = {
    readActionLog,
    readChatLog
}
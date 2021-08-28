const fs = require("fs");

function gridSetting() {
    let returnJSON = {};
    const defaultJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\default\\grid.json", "utf8")
    );
    const userJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\user\\grid.json", "utf8")
    );

    let keys = Object.keys(defaultJSON);
    for (let i = 0; i < keys.length; i++) {
        // ユーザ定義優先 null時default
        returnJSON[keys[i]] = userJSON[keys[i]] || defaultJSON[keys[i]];
    }
    return returnJSON;
}

function chatLogSetting() {
    let returnJSON = {};
    const defaultJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\default\\chatLog.json", "utf8")
    );
    const userJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\user\\chatLog.json", "utf8")
    );

    let keys = Object.keys(defaultJSON);
    for (let i = 0; i < keys.length; i++) {
        // ユーザ定義優先 null時default
        returnJSON[keys[i]] = userJSON[keys[i]] || defaultJSON[keys[i]];
    }
    return returnJSON;
}

function writeChatLogSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\chatLog.json", JSON.stringify(jsondata, null, "\t"));
}

function writeChatLogNotiSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\chatLogNoti.json", JSON.stringify(jsondata, null, "\t"));
}

function chatLogNotiSetting() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\user\\chatLogNoti.json", "utf8")
    );
}

function writeAppSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\app.json", JSON.stringify(jsondata, null, "\t"));
}

function appSetting() {
    let returnJSON = {};
    const defaultJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\default\\app.json", "utf8")
    );
    const userJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\user\\app.json", "utf8")
    );

    let keys = Object.keys(defaultJSON);
    for (let i = 0; i < keys.length; i++) {
        // ユーザ定義優先 null時default
        returnJSON[keys[i]] = userJSON[keys[i]] || defaultJSON[keys[i]];
    }

    return returnJSON;
}

function loadAppLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\main.json", "utf8")
    );
}

function loadChatSettingWindowLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\chatSetting.json", "utf8")
    );
}

function loadNotiWindowLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\notification.json", "utf8")
    );
}

module.exports = {
    gridSetting,
    chatLogSetting,
    writeChatLogSetting,
    writeChatLogNotiSetting,
    chatLogNotiSetting,
    writeAppSetting,
    appSetting,
    loadAppLang,
    loadChatSettingWindowLang,
    loadNotiWindowLang
}
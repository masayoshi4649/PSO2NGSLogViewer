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

function actionLogSetting() {
    let returnJSON = {};
    const defaultJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\default\\actionLog.json", "utf8")
    );
    const userJSON = JSON.parse(
        fs.readFileSync(__dirname + "\\user\\actionLog.json", "utf8")
    );

    let keys = Object.keys(defaultJSON);
    for (let i = 0; i < keys.length; i++) {
        // ユーザ定義優先 null時default
        returnJSON[keys[i]] = userJSON[keys[i]] || defaultJSON[keys[i]];
    }

    return returnJSON;
}

function writeActionLogSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\actionLog.json", JSON.stringify(jsondata, null, "\t"));
}

function writeActionLogNotiSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\actionLogNoti.json", JSON.stringify(jsondata, null, "\t"));
}

function actionLogNotiSetting() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\user\\actionLogNoti.json", "utf8")
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

function loadActionSettingWindowLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\actionSetting.json", "utf8")
    );
}

function loadNotiWindowLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\notification.json", "utf8")
    );
}

function loadAppSettingWindowLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\appSetting.json", "utf8")
    );
}

function loadGridLang() {
    return JSON.parse(
        fs.readFileSync(__dirname + "\\lang\\gridLabel.json", "utf8")
    );
}

module.exports = {
    gridSetting,
    actionLogSetting,
    writeActionLogSetting,
    writeActionLogNotiSetting,
    actionLogNotiSetting,
    writeAppSetting,
    appSetting,
    loadAppLang,
    loadActionSettingWindowLang,
    loadNotiWindowLang,
    loadAppSettingWindowLang,
    loadGridLang
}
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

    console.log("returnJSON=>", returnJSON)
    return returnJSON;
}

function writeActionLogSetting(jsondata) {
    fs.writeFileSync(__dirname + "\\user\\actionLog.json", JSON.stringify(jsondata, null, "\t"));
}


module.exports = {
    gridSetting,
    actionLogSetting,
    writeActionLogSetting
}
"use strict";
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
let mainWindow = null;
let actionSettingWindow = null;
const chokidar = require("chokidar");
const constParams = require(__dirname + "/constParams");
const csvParse = require(__dirname + "/csvParse");
const setting = require(__dirname + "/setting/setting");

let chatLogJSON = [];
let actionLogJSON = [];



const viewTime = [1, 2, 3, 4, 5, 6, 9, 12, 24, 48, 72, 168, 720];
const maxDisplayTime = Math.max(...viewTime);

// デフォルト表示期間(時間)
let displaySelectTime = Math.min(...viewTime);;

const menuTemplate = [
    constParams.menu_file,
    {
        label: "ログ監視期間",
        submenu: menuFileTime(),
    },
    {
        label: "設定",
        submenu: [{
            label: "アクションログ設定",
            click() {
                openActionSettingWindow();
            }
        }]
    },
    constParams.menu_help,
    constParams.menu_dev
]

// メニュー
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

// アプリ情報
app.setAboutPanelOptions(constParams.about);
app.setAppUserModelId(constParams.appName);

// NGSログファイル
const LOG_NGS = app.getPath("documents") + "\\SEGA\\PHANTASYSTARONLINE2\\log_ngs\\";

// 全ウィンドウ閉じた場合終了
app.on("window-all-closed", function () {
    app.quit();
})

// Electronの初期化完了後に実行
app.on("ready", function () {
    mainWindow = new BrowserWindow({
        icon: __dirname + constParams.iconPath,
        webPreferences: constParams.webPreferences,
        width: 1366,
        height: 768,
        frame: true,
        // opacity: 0.8,
        // alwaysOnTop: true
    });

    // mainWindow.setMenu(null);
    // mainWindow.setIgnoreMouseEvents(true);

    mainWindow.loadURL("file://" + __dirname + "/view/index.html");
    watchFiles();

    // 画面読み込み後一度だけ
    mainWindow.once('ready-to-show', () => {
        ipcSendGridStyle();
        sendChatLog();
        sendActionLog();
    })

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
});

function openActionSettingWindow() {
    actionSettingWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        icon: __dirname + constParams.iconPath,
        webPreferences: constParams.webPreferences,
        width: 800,
        height: 600,
        frame: true,
        // opacity: 0.8,
        alwaysOnTop: true
    });

    // actionSettingWindow.setMenu(null);
    // actionSettingWindow.setIgnoreMouseEvents(true);

    actionSettingWindow.loadURL("file://" + __dirname + "/view/actionSetting.html");
}


// IPC送信_チャットログ
function sendChatLog() {
    let fromTime = getFromTime();

    let chatDataLvFile = chatLogJSON.filter(function (item) {
        if (item.endTime > fromTime) return true;
    });

    const chatSetting = setting.chatLogSetting();

    let sendChatData = [];
    for (let i = 0; i < chatDataLvFile.length; i++) {
        let innerData = chatDataLvFile[i].data;
        for (let j = 0; j < innerData.length; j++) {
            let rowTime = new Date(innerData[j].log_time);
            if (rowTime > fromTime) {
                let ignoreFlag = ignoreChat(chatSetting, innerData[j])
                if (ignoreFlag == false) {
                    sendChatData.push({
                        logTime: rowTime,
                        dispDate: getDispDate(rowTime, "YYYY-MM-DD"),
                        dispTime: getDispTime(rowTime, "hh:mm:ss"),
                        playerId: innerData[j].player_id,
                        playerName: innerData[j].player_name,
                        sendTo: innerData[j].send_to,
                        content: innerData[j].content
                    });
                }
            }
        }
    }
    // DESCソート
    sendChatData.sort(function (a, b) {
        if (a.logTime > b.logTime) return -1
        if (a.logTime < b.logTime) return 1
        return 0
    });
    mainWindow.webContents.send("chatLogJSON", sendChatData);
}

// IPC送信_アクションログ
function sendActionLog() {
    let fromTime = getFromTime();

    let actionDataLvFile = actionLogJSON.filter(function (item) {
        if (item.endTime > fromTime) return true;
    });

    const actionSetting = setting.actionLogSetting();

    let sendActionData = [];
    for (let i = 0; i < actionDataLvFile.length; i++) {
        let innerData = actionDataLvFile[i].data;
        for (let j = 0; j < innerData.length; j++) {
            let rowTime = new Date(innerData[j].log_time);
            let actionTypeIsPickup = innerData[j].action_type == "[Pickup]";
            let actionTypeIsDiscard = innerData[j].action_type == "[Discard]";
            if (rowTime > fromTime && innerData[j].item_name != "" && (actionTypeIsPickup == true || actionTypeIsDiscard == true)) {

                let ignoreFlag = ignoreAction(actionSetting, innerData[j])

                if (ignoreFlag == false) {
                    let actionTypeStr;
                    if (actionTypeIsPickup == true) {
                        actionTypeStr = "取得";
                    } else if (actionTypeIsDiscard == true) {
                        actionTypeStr = "売却";
                    }

                    sendActionData.push({
                        logTime: rowTime,
                        dispDate: getDispDate(rowTime, "YYYY-MM-DD"),
                        dispTime: getDispTime(rowTime, "hh:mm:ss"),
                        playerId: innerData[j].player_id,
                        playerName: innerData[j].player_name,
                        actionType: actionTypeStr,
                        itemName: innerData[j].item_name
                    });
                }
            }
        }
    }
    // DESCソート
    sendActionData.sort(function (a, b) {
        if (a.logTime > b.logTime) return -1
        if (a.logTime < b.logTime) return 1
        return 0
    });
    mainWindow.webContents.send("actionLogJSON", sendActionData);
}

// 時刻取得
function getFromTime() {
    let fromTime = new Date();
    fromTime.setHours(fromTime.getHours() - displaySelectTime);
    return fromTime;
}

// 読み捨て用時刻取得
function getHoldTime() {
    let limitTime = new Date();
    limitTime.setHours(limitTime.getHours() - maxDisplayTime);
    return limitTime;
}

// 表示用日時取得
function getDispDate(data, format) {
    let dateData;
    if (data == null) {
        dateData = new Date();
    } else {
        dateData = new Date(data);
    }
    if (format == null) {
        format = "YYYY-MM-DD";
    }
    format = format.replace(/YYYY/g, dateData.getFullYear());
    format = format.replace(/MM/g, ('0' + (dateData.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + dateData.getDate()).slice(-2));
    return format;
}

function getDispTime(data, format) {
    let dateData;
    if (data == null) {
        dateData = new Date();
    } else {
        dateData = new Date(data);
    }
    if (format == null) {
        format = "hh:mm:ss";
    }
    format = format.replace(/hh/g, ('0' + dateData.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + dateData.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + dateData.getSeconds()).slice(-2));
    return format;
}

// IPC送信_グリッドスタイル
function ipcSendGridStyle() {
    mainWindow.webContents.send("gridSetting", setting.gridSetting());
}

// IPC送信_新規チャット送信
function ipcSendNewChat(data) {
    mainWindow.webContents.send("newChat", data);
}

// IPC送信_新規Action送信
function ipcSendNewAction(data) {
    let sendNewActionData = [];

    mainWindow.webContents.send("newAction", data);
}

// IPC受信_表示期間変更
function changeLogTerm(value) {
    displaySelectTime = value;
    sendChatLog();
    sendActionLog();
}

// ファイル監視
function watchFiles() {
    chokidar.watch(LOG_NGS, {
        ignored: /[\/\\]\./,
        usePolling: true
    }).on("all", async (e, path) => {
        // ファイル名
        let fileName = path.replace(LOG_NGS, "");

        if (fileName.startsWith("ChatLog") == true) {
            // チャットログ
            if (e != "unlink") {
                let data = await csvParse.readChatLog(path);
                if (data.length != 0) {
                    let pushData = {
                        "fileName": fileName,
                        "startTime": new Date(data[0].log_time),
                        "endTime": new Date(data[data.length - 1].log_time),
                        "data": data
                    };

                    if (e == "add") {
                        if (pushData.endTime < getHoldTime()) {
                            pushData["data"] = [];
                        }
                        chatLogJSON.push(pushData);
                    } else if (e == "change") {

                        // 前のデータ
                        let olddata = chatLogJSON.filter(function (item) {
                            if (item.fileName == fileName) return true;
                        });

                        // 書き換え
                        chatLogJSON = chatLogJSON.filter(function (item) {
                            if (item.fileName != fileName) return true;
                        });
                        chatLogJSON.push(pushData);

                        // 差分
                        let diffJSON = [];
                        if (olddata.length != 0) {
                            let diffLength = data.length - olddata[0].data.length;
                            for (let i = 0; i < diffLength; i++) {
                                diffJSON.push(data[data.length - 1 - i]);
                            }
                        } else {
                            diffJSON.push(data);
                        }

                        ipcSendNewChat(diffJSON);
                    }
                }
            } else if (e == "unlink") {
                chatLogJSON = chatLogJSON.filter(function (item) {
                    if (item.fileName != fileName) return true;
                });
            }
            sendChatLog();
        } else if (fileName.startsWith("ActionLog") == true) {
            // アクションログ
            if (e != "unlink") {
                let data = await csvParse.readActionLog(path);
                if (data.length != 0) {
                    let pushData = {
                        "fileName": fileName,
                        "startTime": new Date(data[0].log_time),
                        "endTime": new Date(data[data.length - 1].log_time),
                        "data": data
                    };

                    if (e == "add") {
                        if (pushData.endTime < getHoldTime()) {
                            pushData["data"] = [];
                        }
                        actionLogJSON.push(pushData);
                    } else if (e == "change") {
                        // 前のデータ
                        let olddata = actionLogJSON.filter(function (item) {
                            if (item.fileName == fileName) return true;
                        });

                        // 書き換え
                        actionLogJSON = actionLogJSON.filter(function (item) {
                            if (item.fileName != fileName) return true;

                        });
                        actionLogJSON.push(pushData);

                        // 差分
                        let diffJSON = [];
                        if (olddata.length != 0) {
                            let diffLength = data.length - olddata[0].data.length;
                            for (let i = 0; i < diffLength; i++) {
                                diffJSON.push(data[data.length - 1 - i]);
                            }
                        } else {
                            diffJSON.push(data);
                        }
                        ipcSendNewAction(diffJSON);
                    }
                }
            } else if (e == "unlink") {
                actionLogJSON = actionLogJSON.filter(function (item) {
                    if (item.fileName != fileName) return true;
                });
            }
            sendActionLog();
        }
    });
}

// 時間メニュー
function menuFileTime() {
    let submenuArr = [];

    for (let i = 0; i < viewTime.length; i++) {
        submenuArr.push({
            label: viewTime[i] + " 時間",
            type: "radio",
            value: viewTime[i],
            click: function (e) {
                changeLogTerm(e.value);
            }
        });
    }
    return submenuArr;
}

// チャットログ_無視オプション
function ignoreChat(setting, data) {
    // 無視_ロビアク
    if (setting["ignoreLobyAction"] == true) {
        if (data["content"].indexOf("/la") != -1 || data["content"].indexOf("/cla") != -1) {
            return true
        }
    }

    // 無視_マイファッション
    if (setting["ignoreMyFashion"] == true) {
        if (data["content"].indexOf("/mf") != -1) {
            return true
        }
    }

    // 無視_スタンプ
    if (setting["ignoreStamp"] == true) {
        if (data["content"].indexOf("/stamp") != -1) {
            return true
        }
    }

    // 無視_uioff
    if (setting["ignoreUioff"] == true) {
        if (data["content"].indexOf("/uioff") != -1) {
            return true
        }
    }

    // 無視_カメラ目線
    if (setting["ignoreCameraEye"] == true) {
        if (data["content"].indexOf("/ce") != -1) {
            return true
        }
    }
    // 無視_カットイン
    if (setting["ignoreCutin"] == true) {
        if (data["content"].indexOf("/ci") != -1) {
            return true
        }
    }
    return false
}

// チャットログ_無視オプション
function ignoreAction(setting, data) {
    // 無視_売却
    if (setting["ignoreSell"] == true) {
        if (data["action_type"] == "[Discard]") {
            return true
        }
    }
    // 無視_取得
    if (setting["ignoreGet"] == true) {
        if (data["action_type"] == "[Pickup]") {
            return true
        }
    }
    // 無視_レスタサイン
    if (setting["ignoreRestaSign"] == true) {
        if (data["item_name"] == "RestaSign") {
            return true
        }
    }
    // 無視_リバーサーサイン
    if (setting["ignoreRestaSign"] == true) {
        if (data["item_name"] == "ReverserSign") {
            return true
        }
    }
    return false
}
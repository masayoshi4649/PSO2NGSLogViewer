"use strict";
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
// const dialog = electron.dialog
let mainWindow = null;
let actionSettingWindow = null;
let actionNotiSettingWindow = null;
let appSettingWindow = null;
const chokidar = require("chokidar");
const constParams = require(__dirname + "/constParams");
const csvParse = require(__dirname + "/csvParse");
const setting = require(__dirname + "/setting/setting");

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
        },
        {
            label: "通知設定",
            click() {
                openActionNotiSettingWindow();
            }
        },
        {
            label: "アプリ設定",
            click() {
                openAppSettingWindow();
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
    const appSetting = setting.appSetting();
    mainWindow = new BrowserWindow({
        title: constParams.appName,
        icon: __dirname + constParams.iconPath,
        webPreferences: constParams.webPreferences,
        width: 683,
        height: 768,
        frame: true,
        opacity: appSetting["opacity"] / 100,
        alwaysOnTop: appSetting["alwaysOnTop"]
    });

    // mainWindow.setMenu(null);

    mainWindow.loadURL("file://" + __dirname + "/view/index.html");
    watchFiles();

    // 画面読み込み後一度だけ
    mainWindow.once("ready-to-show", () => {
        ipcSendGridStyle();
        sendActionLog();
        ipcSendNewActionNoti(setting.actionLogNotiSetting());
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
        width: 400,
        height: 300,
        frame: true,
    });
    actionSettingWindow.setMenu(null);
    actionSettingWindow.loadURL("file://" + __dirname + "/view/actionSetting.html");

    // 現在の設定
    actionSettingWindow.once("ready-to-show", () => {
        actionSettingWindow.webContents.send("currentSetting", setting.actionLogSetting());
    })
}

function openActionNotiSettingWindow() {
    actionNotiSettingWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        icon: __dirname + constParams.iconPath,
        webPreferences: constParams.webPreferences,
        width: 800,
        height: 600,
        frame: true,
    });

    actionNotiSettingWindow.setMenu(null);
    actionNotiSettingWindow.loadURL("file://" + __dirname + "/view/notification.html");

    // 現在の設定
    actionNotiSettingWindow.once("ready-to-show", () => {
        actionNotiSettingWindow.webContents.send("currentSetting", setting.actionLogNotiSetting());
    })
}

// アプリ設定画面
function openAppSettingWindow() {
    appSettingWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        icon: __dirname + constParams.iconPath,
        webPreferences: constParams.webPreferences,
        width: 400,
        height: 200,
        frame: true,
    });

    appSettingWindow.setMenu(null);
    appSettingWindow.loadURL("file://" + __dirname + "/view/appSetting.html");


    // 現在の設定
    appSettingWindow.once("ready-to-show", () => {
        appSettingWindow.webContents.send("currentSetting", setting.appSetting());
    })
}

// IPC送信_アクションログ
function sendActionLog() {
    let fromTime = getFromTime();

    let actionDataLvFile = actionLogJSON.filter(function (item) {
        if (item.endTime > fromTime) return true;
    });

    let actionSetting = setting.actionLogSetting();

    let sendActionData = [];
    for (let i = 0; i < actionDataLvFile.length; i++) {
        let innerData = actionDataLvFile[i].data;
        for (let j = 0; j < innerData.length; j++) {
            let rowTime = new Date(innerData[j].log_time);
            let actionTypeIsPickup = (innerData[j].action_type == "[Pickup]");
            let actionTypeIsDiscard = (innerData[j].action_type == "[Discard]");
            if (rowTime > fromTime && innerData[j].item_name != "" && (actionTypeIsPickup == true || actionTypeIsDiscard == true)) {
                // 無視フラグ
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
    format = format.replace(/MM/g, ("0" + (dateData.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ("0" + dateData.getDate()).slice(-2));
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
    format = format.replace(/hh/g, ("0" + dateData.getHours()).slice(-2));
    format = format.replace(/mm/g, ("0" + dateData.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ("0" + dateData.getSeconds()).slice(-2));
    return format;
}

// IPC送信_グリッドスタイル
function ipcSendGridStyle() {
    mainWindow.webContents.send("gridSetting", setting.gridSetting());
}

// IPC送信_新規Action送信
function ipcSendNewAction(data) {
    let sendNewActionData = [];

    mainWindow.webContents.send("newAction", data);
}

// IPC受信_表示期間変更
function changeLogTerm(value) {
    displaySelectTime = value;
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
        if (fileName.startsWith("ActionLog") == true) {
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

// IPC受信_ログ設定変更
ipcMain.on("NewActionLogSetting", (e, jsondata) => {
    setting.writeActionLogSetting(jsondata);
    actionSettingWindow.close();
    sendActionLog();
});

// アクションログ_無視オプション
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

// IPC受信_通知設定
ipcMain.on("NewActionLogNotiSetting", (e, jsondata) => {
    ipcSendNewActionNoti(jsondata);
    actionNotiSettingWindow.close();
    setting.writeActionLogNotiSetting(jsondata);
})

// IPC送信_新規通知設定
function ipcSendNewActionNoti(jsondata) {
    mainWindow.webContents.send("NewActionLogNotiSetting", jsondata);
}

// IPC受信_アプリ設定
ipcMain.on("NewAppSetting", (e, jsondata) => {
    setting.writeAppSetting(jsondata);
    app.relaunch();
    app.exit();
})
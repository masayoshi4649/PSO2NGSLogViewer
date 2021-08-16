const { app } = require("electron");

const appName = "PSO2NGS Action LogViewer";
const releaseNum = "2021.08.16";

const iconPath = "/asset/rappy.png"

const webPreferences = {
    nodeIntegration: true,
    contextIsolation: false,
    webviewTag: false,
    defaultFontFamily: {
        standard: "Meiryo UI",
        serif: "Meiryo UIMeiryo UI",
        sansSerif: "Meiryo UI",
        monospace: "Meiryo UI"
    }
}

const about = {
    applicationName: appName, // アプリ名
    applicationVersion: "バージョン： " + releaseNum, // アプリのバージョン
    copyright: "作成：4鯖のクソパンダ", // コピーライト
    credits: "@4649masayoshi", // クレジット
}

const menu_file = {
    label: "ファイル",
    submenu: [
        {
            label: "再起動",
            click() {
                app.relaunch();
                app.exit();
            }
        },
        {
            label: "終了",
            click() {
                app.quit();
            }
        }
    ]
}


const menu_help = {
    label: "ヘルプ",
    submenu: [
        {
            label: appName + " について",
            role: "about",
        },
        {
            label: "フルスクリーン",
            role: "togglefullscreen",
            accelerator: "F11"
        },
    ]
}


const menu_dev = {
    label: "開発者",
    submenu: [
        {
            label: "開発者ツール",
            role: "toggleDevTools",
            accelerator: "Alt+D"
        }
    ]
}

module.exports = {
    appName,
    iconPath,
    webPreferences,
    about,
    menu_file,
    menu_help,
    menu_dev
}

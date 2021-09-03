const appName = "PSO2NGS Chat LogViewer";
const releaseNum = "2021.09.03";

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
    applicationVersion: "Ver." + releaseNum, // アプリのバージョン
    copyright: "MIT Licence", // コピーライト
    credits: "\nRepository:\ngithub.com/masayoshi4649/PSO2NGSLogViewer", // クレジット
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
    menu_dev
}

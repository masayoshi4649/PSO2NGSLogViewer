const appName = "PSO2NGS LogViewer";
const releaseNum = "2021.07.14";

const iconPath = "/asset/rappy.ico"

const webPreferences = {
    nodeIntegration: true,
    contextIsolation: false,
    webviewTag: true,
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
    menu_help,
    menu_dev
}

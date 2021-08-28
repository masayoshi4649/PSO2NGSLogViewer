const ipcRenderer = require("electron").ipcRenderer;
const cheetahGrid = require("cheetah-grid");

// noti
let notiSetting = [];

// Grid
let chatLogGrid;

window.onload = function () {
    ipcRendererStyle.send("gridSetting")
}

// IPC受信_新着チャット
ipcRenderer.on("newChat", (e, data) => {
    for (let i = 0; i < data.length; i++) {

        let notiinfo = checkNoti(data[i].content);
        if (notiinfo["noti"] == true) {
            notify("New!", data[i].content, (!notiinfo["notisound"]));
        }
    }
});

// トースト通知
function notify(title, mes, silent) {
    new Notification(title, {
        title: "New Chat",
        body: mes,
        silent: silent,
        icon: __dirname + "\\rappy.png",
        // toastXml: null
    });
}


const ipcRendererStyle = require("electron").ipcRenderer;

let styleConf = null;

ipcRendererStyle.on("gridSetting", (e, data) => {
    styleConf = data["style"];
    const userLang = data["userLang"];
    const label = data["label"];

    // ログ変色時間
    const checkSec = styleConf["recentTime"];
    const fontSize = 16;

    const headerChat = [
        [
            {
                "caption": label["date"][userLang],
                "width": "120px",
                "rowSpan": 1
            }, {
                "caption": label["playerName"][userLang],
                "width": "200px",
                "rowSpan": 1
            },
            {
                "caption": label["content"][userLang],
                "width": "calc(97.5% - 320px)",
                "rowSpan": 2
            }
        ],
        [
            {
                "caption": label["time"][userLang],
                "rowSpan": 1
            },
            {
                "caption": label["playerID"][userLang],
                "field": "playerId",
                "rowSpan": 1
            }
        ]
    ];

    const bodyChat = [
        [
            {
                "field": "dispDate",
                "rowSpan": 1,
                style(rec) {
                    let style = getChatColor(rec.sendTo);
                    style["textAlign"] = "center";
                    return style;
                }
            },
            {
                "field": "playerName",
                style(rec) {
                    let style = getChatColor(rec.sendTo);
                    style["textAlign"] = "center";
                    return style;
                }
            },
            {
                "field": "content",
                "rowSpan": 2,
                columnType: 'multilinetext',
                style(rec) {
                    let style = getChatColor(rec.sendTo);
                    style["autoWrapText"] = true;
                    if (rec.content.length <= 18) {
                        style["font"] = 18 + "px Meiryo UI"
                    } else if (19 < rec.content.length <= 36) {
                        style["font"] = 15 + "px Meiryo UI"
                    } else {
                        style["font"] = 13 + "px Meiryo UI"
                    }

                    return style;
                }
            }
        ], [
            {
                "field": "dispTime",
                "rowSpan": 1,
                style(rec) {
                    let now = new Date();
                    // checkSec前秒を取得
                    now.setSeconds(now.getSeconds() - checkSec);
                    let style = getChatColor(rec.sendTo);
                    if (rec.logTime > now) {
                        style.color = styleConf["recentColor"];
                    };
                    style["textAlign"] = "center"
                    return style;
                }
            },
            {
                "field": "playerId",
                style(rec) {
                    let style = getChatColor(rec.sendTo);
                    style["textAlign"] = "center";
                    return style;
                }
            }
        ]
    ];

    const userTheme = {
        underlayBackgroundColor: styleConf["bgColor"],
        borderColor(args) {
            if (args.row % 2 == 0) {
                return [null, "#00FFFF", null];
            } else {
                return [null, "#00FFFF", "#00FFFF"];
            }
        },
        font: fontSize + "px Meiryo UI",
        frozenRowsBgColor: styleConf["titlebgColor"],
        frozenRowsColor: styleConf["titleColor"]
    }

    let gridOptionChat = {
        parentElement: document.querySelector("#chatlog"),
        layout: {
            header: headerChat,
            body: bodyChat,
        },
        headerRowHeight: 30,
        defaultRowHeight: 30,
        theme: userTheme
    }

    function getChatColor(value) {
        let bgColor = styleConf["bgColor"];
        let color = "#FFFFFF";
        switch (value) {
            case "PUBLIC":
                bgColor = styleConf["bgColor"];
                break;
            case "PARTY":
                bgColor = "#000080";
                break;
            case "GUILD":
                bgColor = "#8b4513";
                break;
            case "REPLY":
                bgColor = "#8b008b";
                break;
            case "GROUP":
                bgColor = "#556b2f";
                break;
            default:
                bgColor = "#696969";
                break;
        }
        return {
            bgColor: bgColor,
            color: color
        }
    }

    // Grid
    chatLogGrid = new cheetahGrid.ListGrid(gridOptionChat);

    // Grid更新_チャットログ
    function updateChatGrid(data) {
        if (data) {
            chatLogGrid.records = data;
        }
    }

    // IPC受信_チャット
    ipcRenderer.on("chatLogJSON", (e, data) => {
        if (data) {
            updateChatGrid(data);
        }
    });
});

// IPC受信_通知設定
ipcRenderer.on("NewChatLogNotiSetting", (e, data) => {
    notiSetting = data;
});

// 通知判定
function checkNoti(word) {
    let returnjson = {
        "noti": false,
        "notisound": false
    }

    for (let i = 0; i < notiSetting.length; i++) {
        // 検索情報
        let hitType = notiSetting[i]["hitType"]
        let inputtext = notiSetting[i]["inputtext"]
        let notisound = notiSetting[i]["notisound"]

        if (hitType == "partial") {
            // 部分一致
            if (word.indexOf(inputtext) > -1) {
                returnjson = {
                    "noti": true,
                    "notisound": notisound
                }
            }
        } else if (hitType == "perfect") {
            // 完全一致
            if (word == inputtext) {
                returnjson = {
                    "noti": true,
                    "notisound": notisound
                }
            }
        }
    }
    return returnjson;
}

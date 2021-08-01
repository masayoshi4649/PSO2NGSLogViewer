const ipcRenderer = require("electron").ipcRenderer;
const cheetahGrid = require("cheetah-grid");


// Grid
let chatLogGrid;
let actionLogGrid;

window.onload = function () {
    ipcRendererStyle.send("gridSetting")
}

// IPC受信_チャット
ipcRenderer.on("chatLogJSON", (e, data) => {
    updateChatGrid(data);
});

// IPC受信_新着チャット
ipcRenderer.on("newChat", (e, data) => {
    let displayStr = "";
    for (let i = 0; i < data.length; i++) {
        if (data[i].send_to == "REPLY") {
            displayStr = displayStr + "From ：" + data[i].player_name + "\r\n" + data[i].content + "\r\n";
        }
    }
    if (displayStr != "") {
        notify("新着チャット", displayStr, false);
    }
});

// IPC受信_アクション
ipcRenderer.on("actionLogJSON", (e, data) => {
    updateActionGrid(data);
});

// IPC受信_新着アクション
ipcRenderer.on("newAction", (e, data) => {
    let displayStr = "";
    for (let i = 0; i < data.length; i++) {
        let actionTypeIsPickup = data[i].action_type == "[Pickup]";
        let actionTypeIsDiscard = data[i].action_type == "[Discard]";
        if (data[i].item_name != "") {
            displayStr = displayStr + data[i].item_name + "\r\n";
        }
    }
    if (displayStr != "") {
        // notify("新着ドロップ", displayStr, false);
    }
});

// トースト通知
function notify(title, mes, silent) {
    new Notification(title, {
        title: "新着通知",
        body: mes,
        silent: silent,
        icon: "./wis.ico",
        // toastXml: null
    });
}

// Grid更新_チャットログ
function updateChatGrid(data) {
    chatLogGrid.records = data;
}

// Grid更新_チャットログ
function updateActionGrid(data) {
    actionLogGrid.records = data;
}

const ipcRendererStyle = require("electron").ipcRenderer;

let styleConf = null;

ipcRendererStyle.on("gridSetting", (e, data) => {
    styleConf = data;

    // ログ変色時間
    const checkMin = styleConf["recentTime"];
    const fontSize = 16;
    const fontSizeAction = 22;

    const headerChat = [
        [
            {
                "caption": "日付",
                "width": "120px",
                "rowSpan": 1
            }, {
                "caption": "プレイヤー名",
                "width": "200px",
                "rowSpan": 1
            },
            {
                "caption": "内容",
                "width": "calc(97.5% - 320px)",
                "rowSpan": 2
            }
        ],
        [
            {
                "caption": "時間",
                "rowSpan": 1
            },
            {
                "caption": "プレイヤーID",
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
                        style["font"] = 20 + "px Meiryo UI"
                    } else if (19 < rec.content.length <= 36) {
                        style["font"] = 17 + "px Meiryo UI"
                    } else {
                        style["font"] = 14 + "px Meiryo UI"
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
                    // checkMin前分を取得
                    now.setMinutes(now.getMinutes() - checkMin);
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

    const headerAction = [
        [
            {
                "caption": "日付",
                "width": "120px",
                "rowSpan": 1
            },
            {
                "caption": "種別",
                "width": "50px",
                "rowSpan": 2
            },
            {
                "caption": "アイテム名",
                "width": "auto",
                "rowSpan": 2,
                "width": "calc(95% - 170px)"
            }],
        [
            {
                "caption": "時間",
                "rowSpan": 1
            }
        ]
    ];

    const bodyAction = [
        [
            {
                "field": "dispDate",
                "rowSpan": 1,
                style(rec) {
                    let style = getActionColor(rec.actionType);
                    style["textAlign"] = "center";
                    return style;
                }
            },
            {
                "field": "actionType",
                "rowSpan": 2,
                style(rec) {
                    let style = getActionColor(rec.actionType);
                    style["textAlign"] = "center";
                    return style;
                }
            },
            {
                "field": "itemName",
                "rowSpan": 2,
                style(rec) {
                    let style = getActionColor(rec.actionType);
                    style["font"] = fontSizeAction + "px Meiryo UI"
                    return style;
                }
            }
        ], [
            {
                "field": "dispTime",
                "rowSpan": 1,
                style(rec) {
                    let now = new Date();
                    // checkMin前分を取得
                    now.setMinutes(now.getMinutes() - checkMin);
                    let style = getActionColor(rec.actionType);
                    if (rec.logTime > now) {
                        style.color = styleConf["recentColor"];
                    };
                    style["textAlign"] = "center"
                    return style;
                }
            }
        ]
    ]

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

    let gridOptionAction = {
        parentElement: document.querySelector("#actionlog"),
        layout: {
            header: headerAction,
            body: bodyAction,
        },
        headerRowHeight: 30,
        defaultRowHeight: 20,
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

    function getActionColor(value) {
        let bgColor = styleConf["bgColor"];
        let color = "#FFFFFF";
        switch (value) {
            case "取得":
                bgColor = styleConf["getbgColor"];
                color = styleConf["getColor"];
                break;
            case "売却":
                bgColor = styleConf["sellbgColor"];
                color = styleConf["sellColor"];
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
    actionLogGrid = new cheetahGrid.ListGrid(gridOptionAction);
});


const ipcRenderer = require("electron").ipcRenderer;
const cheetahGrid = require("cheetah-grid");

// noti
let notiSetting = [];

// Grid
let actionLogGrid;

window.onload = function () {
    ipcRendererStyle.send("gridSetting")
}

// IPC受信_アクション
ipcRenderer.on("actionLogJSON", (e, data) => {
    updateActionGrid(data);
});

// IPC受信_新着アクション
ipcRenderer.on("newAction", (e, data) => {
    for (let i = 0; i < data.length; i++) {
        let actionTypeIsPickup = (data[i].action_type == "[Pickup]");

        if (actionTypeIsPickup == true) {
            let notiinfo = checkNoti(data[i].item_name);
            if (notiinfo["noti"] == true) {
                notify("新着ドロップ", data[i].item_name, (!notiinfo["notisound"]));
            }
        }
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

// Grid更新_アクションログ
function updateActionGrid(data) {
    actionLogGrid.records = data;
}

const ipcRendererStyle = require("electron").ipcRenderer;

let styleConf = null;

ipcRendererStyle.on("gridSetting", (e, data) => {
    styleConf = data;

    // ログ変色時間
    const checkSec = styleConf["recentTime"];
    const fontSize = 16;
    const fontSizeAction = 22;


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
                    // checkSec前秒を取得
                    now.setSeconds(now.getSeconds() - checkSec);
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
    actionLogGrid = new cheetahGrid.ListGrid(gridOptionAction);
});

// IPC受信_通知設定
ipcRenderer.on("NewActionLogNotiSetting", (e, data) => {
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
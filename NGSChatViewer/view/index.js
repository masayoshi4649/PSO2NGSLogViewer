const ipcRenderer = require("electron").ipcRenderer;
const cheetahGrid = require("cheetah-grid");

// 表示期間選択
const displaySelectTime = document.getElementById("displaySelectTime");

// Grid
const chatLogGrid = new cheetahGrid.ListGrid(gridOptionChat);
const actionLogGrid = new cheetahGrid.ListGrid(gridOptionAction);

window.onload = function () {

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
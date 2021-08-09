const ipcRenderer = require("electron").ipcRenderer;

const ignoreSell = document.getElementById("ignoreSell");
const ignoreGet = document.getElementById("ignoreGet");
const ignoreRestaSign = document.getElementById("ignoreRestaSign");
const ignoreReverserSign = document.getElementById("ignoreReverserSign");

document.getElementById("okbutton").onclick = function () {
    let settingValue = inputGet();
    sendSetting(settingValue);
};

// 設定をマージ
function inputGet() {
    const ignoreSellChecked = ignoreSell.checked;
    const ignoreGetChecked = ignoreGet.checked;
    const ignoreRestaSignChecked = ignoreRestaSign.checked;
    const ignoreReverserSignChecked = ignoreReverserSign.checked;

    return {
        ignoreSell: ignoreSellChecked,
        ignoreGet: ignoreGetChecked,
        ignoreRestaSign: ignoreRestaSignChecked,
        ignoreReverserSign: ignoreReverserSignChecked
    }
}

// 設定を送信
function sendSetting(jsondata) {
    ipcRenderer.send("NewActionLogSetting", jsondata);
}

// 現在の設定を受信
ipcRenderer.on("currentSetting", (e, data) => {
    loadCurrentSetting(data);
});

function loadCurrentSetting(data) {
    ignoreSell.checked = data["ignoreSell"];
    ignoreGet.checked = data["ignoreGet"];
    ignoreRestaSign.checked = data["ignoreRestaSign"];
    ignoreReverserSign.checked = data["ignoreReverserSign"];
}
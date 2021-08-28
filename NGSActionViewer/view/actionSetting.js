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

// ラベルを受信
ipcRenderer.on("displabel", (e, data) => {
    const userLang = data["userLang"];
    const label = data["label"];
    const labelKeys = Object.keys(label);

    for (let i = 0; i < labelKeys.length; i++) {
        document.getElementById(labelKeys[i]).innerHTML = label[labelKeys[i]][userLang];
    }
});

function loadCurrentSetting(data) {
    ignoreSell.checked = data["ignoreSell"];
    ignoreGet.checked = data["ignoreGet"];
    ignoreRestaSign.checked = data["ignoreRestaSign"];
    ignoreReverserSign.checked = data["ignoreReverserSign"];
}
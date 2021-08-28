const ipcRenderer = require("electron").ipcRenderer;

const ignoreLobyAction = document.getElementById("ignoreLobyAction");
const ignoreMyFashion = document.getElementById("ignoreMyFashion");
const ignoreStamp = document.getElementById("ignoreStamp");
const ignoreUioff = document.getElementById("ignoreUioff");
const ignoreCameraEye = document.getElementById("ignoreCameraEye");
const ignoreCutin = document.getElementById("ignoreCutin");

document.getElementById("okbutton").onclick = function () {
    let settingValue = inputGet();
    sendSetting(settingValue);
};

// 設定をマージ
function inputGet() {
    const ignoreLobyActionChecked = ignoreLobyAction.checked;
    const ignoreMyFashionChecked = ignoreMyFashion.checked;
    const ignoreStampChecked = ignoreStamp.checked;
    const ignoreUioffChecked = ignoreUioff.checked;
    const ignoreCameraEyeChecked = ignoreCameraEye.checked;
    const ignoreCutinChecked = ignoreCutin.checked;

    return {
        ignoreLobyAction: ignoreLobyActionChecked,
        ignoreMyFashion: ignoreMyFashionChecked,
        ignoreStamp: ignoreStampChecked,
        ignoreUioff: ignoreUioffChecked,
        ignoreCameraEye: ignoreCameraEyeChecked,
        ignoreCutin: ignoreCutinChecked
    }
}

// 設定を送信
function sendSetting(jsondata) {
    ipcRenderer.send("NewChatLogSetting", jsondata);
}

// 現在の設定を受信
ipcRenderer.on("currentSetting", (e, data) => {
    loadCurrentSetting(data)
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
    ignoreLobyAction.checked = data["ignoreLobyAction"];
    ignoreMyFashion.checked = data["ignoreMyFashion"];
    ignoreStamp.checked = data["ignoreStamp"];
    ignoreUioff.checked = data["ignoreUioff"];
    ignoreCameraEye.checked = data["ignoreCameraEye"];
    ignoreCutin.checked = data["ignoreCutin"];
}
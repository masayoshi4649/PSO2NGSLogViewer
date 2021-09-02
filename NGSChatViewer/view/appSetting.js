const ipcRenderer = require("electron").ipcRenderer;

const language = document.getElementById("language");
const opacity = document.getElementById("opacity");
const alwaysOnTop = document.getElementById("alwaysOnTop");

document.getElementById("okbutton").onclick = function () {
    let settingValue = inputGet();
    sendSetting(settingValue);
};

// 設定をマージ
function inputGet() {
    const languageValue = language.value;
    const opacityValue = opacity.value;
    const alwaysOnTopChecked = alwaysOnTop.checked;

    return {
        "lang": languageValue,
        "opacity": opacityValue,
        "alwaysOnTop": alwaysOnTopChecked
    }
}

// 設定を送信
function sendSetting(jsondata) {
    ipcRenderer.send("NewAppSetting", jsondata);
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
    language.value = data["lang"];
    opacity.value = data["opacity"];
    alwaysOnTop.checked = data["alwaysOnTop"];
}
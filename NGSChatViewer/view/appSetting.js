const ipcRenderer = require("electron").ipcRenderer;

const opacity = document.getElementById("opacity");
const alwaysOnTop = document.getElementById("alwaysOnTop");

document.getElementById("okbutton").onclick = function () {
    let settingValue = inputGet();
    sendSetting(settingValue);
};

// 設定をマージ
function inputGet() {
    const opacityValue = opacity.value;
    const alwaysOnTopChecked = alwaysOnTop.checked;

    return {
        opacity: opacityValue,
        alwaysOnTop: alwaysOnTopChecked
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

function loadCurrentSetting(data) {
    opacity.value = data["opacity"];
    alwaysOnTop.checked = data["alwaysOnTop"];
}
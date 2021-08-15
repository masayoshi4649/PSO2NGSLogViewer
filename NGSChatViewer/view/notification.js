const ipcRenderer = require("electron").ipcRenderer;

const table = document.getElementById("table");
const errorarea = document.getElementById("error")
const inputtext = document.getElementsByClassName("inputtext");
const hitType = document.getElementsByClassName("hitType");
const notisound = document.getElementsByClassName("notisound");

document.getElementById("coladd").onclick = addClicked;
function addClicked() {
    coladd();
}

document.getElementById("okbutton").onclick = function () {
    let inputCheckErr = checkEmptyText();
    if (inputCheckErr == false) {
        errorarea.innerHTML = null;
        // IPC送信_保存
        sendSetting(inputGet());
    } else {
        // alert("空白の行があります");
        errorarea.innerHTML = "<h2>エラー：空白の行があります</h2> "

    }
}

// 行追加
function coladd(defaultText, matchSelect, notiSound) {
    // 行を行末に追加
    let row = table.insertRow(-1);
    //td分追加
    let cell1 = row.insertCell(-1);
    let cell2 = row.insertCell(-1);
    let cell3 = row.insertCell(-1);
    let cell4 = row.insertCell(-1);
    // セルの内容入力
    cell1.innerHTML = cellText(defaultText || "");
    cell2.innerHTML = cellMatchSelect(matchSelect || "partial");
    cell3.innerHTML = cellNotiSound(notiSound || true);
    cell4.innerHTML = delBtn();
}

// 行削除
function coldel(obj) {
    // 削除ボタンを押下された行を取得
    let tr = obj.parentNode.parentNode;
    // trのインデックスを取得して行を削除する
    tr.parentNode.deleteRow(tr.sectionRowIndex);
}

// 文字列
function cellText(defaultText) {
    let resultarr = [];
    resultarr.push("<input type='text' value='" + defaultText + "' class='inputtext'>");

    return resultarr.join("")
}

// 部分一致/完全一致
function cellMatchSelect(selected) {
    let partialSelected = "";
    let perfectSelected = "";

    if (selected == "partial") {
        partialSelected = "selected"
    }
    if (selected == "perfect") {
        perfectSelected = "selected"
    }

    let resultarr = [];
    resultarr.push("<select class='hitType'>")
    resultarr.push("<option value='partial' " + partialSelected + ">部分一致</option>")
    resultarr.push("<option value='perfect' " + perfectSelected + ">完全一致</option>")
    resultarr.push("</select>")

    return resultarr.join("")
}

// 通知音
function cellNotiSound(checked) {
    let checkedstr = "";
    if (checked == true) {
        checkedstr = "checked";
    }
    let resultarr = [];
    resultarr.push("<input type='checkbox' class='notisound' " + checkedstr + ">");

    return resultarr.join("")
}

// 削除ボタン
function delBtn() {
    return "<input type='button' value='削除' class='coldel' onclick='coldel(this)'>";
}

// 空白チェック
function checkEmptyText() {
    let returnbool = false;

    for (let i = 0; i < inputtext.length; i++) {
        if (inputtext[i].value == null || inputtext[i].value == "") {
            returnbool = true;
        }
    }
    return returnbool;
}

// 入力取得
function inputGet() {
    let resultarr = [];
    for (let i = 0; i < inputtext.length; i++) {
        resultarr.push({
            inputtext: inputtext[i].value,
            hitType: hitType[i].value,
            notisound: notisound[i].checked
        })
    }
    return resultarr;
}


// 設定を送信
function sendSetting(jsondata) {
    ipcRenderer.send("NewChatLogNotiSetting", jsondata);
}
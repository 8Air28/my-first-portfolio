// ----------------------
// 初期設定
// ----------------------
const display = document.getElementById("display");
const buttonsContainer = document.getElementById("buttons");
const variablesList = document.getElementById("variables");
const historyList = document.getElementById("history");

let mode = "DEG";
let savedVariables = {};
let savedLayouts = {};
const variableNameInput = document.getElementById("variable-name");
const saveVariableBtn = document.getElementById("save-variable");

// ----------------------
// 初期ボタン設定
// ----------------------
const defaultButtons = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "=",
  "+",
  "sin",
  "cos",
  "tan",
  "log",
  "√",
  "^",
  "C",
];

function loadButtonLayout() {
  const saved = JSON.parse(localStorage.getItem("buttonLayout"));
  const buttons = saved || defaultButtons;
  buttonsContainer.innerHTML = "";
  buttons.forEach((val) => {
    const btn = document.createElement("button");
    btn.textContent = val;
    btn.onclick = () => handleButtonClick(val);
    buttonsContainer.appendChild(btn);
  });
}
loadButtonLayout();

// ----------------------
// ボタン処理
// ----------------------
function handleButtonClick(val) {
  if (val === "=") {
    calculate();
    return;
  }
  if (val === "C") {
    display.value = "";
    return;
  }
  if (["sin", "cos", "tan", "log", "√"].includes(val)) {
    insertFunctionWithParenthesis(val + "(");
    return;
  }
  display.value += val;
}

// ----------------------
// 関数入力補完＋カーソル位置
// ----------------------
function insertFunctionWithParenthesis(funcName) {
  const start = display.selectionStart;
  const end = display.selectionEnd;
  const text = display.value;
  display.value = text.slice(0, start) + funcName + "()" + text.slice(end);
  display.selectionStart = display.selectionEnd = start + funcName.length + 1;
  display.focus();
}

// ----------------------
// 計算
// ----------------------
function calculate() {
  try {
    let expr = display.value.replace(/π/g, Math.PI);
    if (mode === "RAD") expr = expr;
    else expr = expr.replace(/(\w+)\(/g, "Math.$1(");
    const result = eval(expr);
    display.value = result;
    addHistory(result);
  } catch {
    display.value = "Error";
  }
}

// ----------------------
// 履歴
// ----------------------
function addHistory(entry) {
  const li = document.createElement("li");
  li.textContent = entry;
  li.onclick = () => (display.value = entry);
  historyList.appendChild(li);
}

// ----------------------
// 変数保存
// ----------------------
function saveVariable(name, value) {
  savedVariables[name] = value;
  updateVariableList();
}

function updateVariableList() {
  variablesList.innerHTML = "";
  for (let name in savedVariables) {
    const li = document.createElement("li");
    const input = document.createElement("input");
    input.value = savedVariables[name];
    input.onchange = () => {
      savedVariables[name] = input.value;
    };
    li.appendChild(document.createTextNode(name + ": "));
    li.appendChild(input);

    const callBtn = document.createElement("button");
    callBtn.textContent = "呼出";
    callBtn.onclick = () => (display.value += savedVariables[name]);
    li.appendChild(callBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      delete savedVariables[name];
      updateVariableList();
    };
    li.appendChild(delBtn);

    variablesList.appendChild(li);
  }
}

// 保存変数ボタン
saveVariableBtn.onclick = () => {
  const name = variableNameInput.value.trim();
  if (!name) return alert("変数名を入力してください");
  savedVariables[name] = display.value || "0";
  updateVariableList();
  variableNameInput.value = "";
};

// ----------------------
// DEG / RAD 切替
// ----------------------
document.getElementById("mode-toggle").onclick = () => {
  mode = mode === "DEG" ? "RAD" : "DEG";
  document.getElementById("mode-toggle").textContent = mode;
};

// ----------------------
// 配置編集・保存・読み込み
// ----------------------
function saveCurrentLayout(name) {
  if (!name) return alert("名前を入力してください");
  const layout = [];
  buttonsContainer
    .querySelectorAll("button")
    .forEach((btn) => layout.push(btn.textContent));
  savedLayouts[name] = layout;
  localStorage.setItem("savedLayouts", JSON.stringify(savedLayouts));
  updateLayoutSelector();
}
function loadLayout(name) {
  if (!savedLayouts[name]) return;
  localStorage.setItem("buttonLayout", JSON.stringify(savedLayouts[name]));
  loadButtonLayout();
}
function deleteLayout(name) {
  delete savedLayouts[name];
  localStorage.setItem("savedLayouts", JSON.stringify(savedLayouts));
  updateLayoutSelector();
}
function updateLayoutSelector() {
  const sel = document.getElementById("load-layout");
  sel.innerHTML = "";
  for (let name in savedLayouts) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
}
document.getElementById("save-layout").onclick = () =>
  saveCurrentLayout(document.getElementById("layout-name").value.trim());
document.getElementById("load-layout").onchange = () =>
  loadLayout(document.getElementById("load-layout").value);
document.getElementById("delete-layout").onclick = () =>
  deleteLayout(document.getElementById("load-layout").value);
document.getElementById("reset-layout").onclick = () => {
  localStorage.removeItem("buttonLayout");
  loadButtonLayout();
};

// ----------------------
// 保存レイアウト読み込み
// ----------------------
savedLayouts = JSON.parse(localStorage.getItem("savedLayouts") || "{}");
updateLayoutSelector();

// ----------------------
// 配置編集（Sortable.js利用）
// ----------------------
let editMode = false;
document.getElementById("edit-layout").onclick = () => {
  editMode = !editMode;
  buttonsContainer.classList.toggle("edit-mode", editMode);
  if (editMode) {
    Sortable.create(buttonsContainer, { animation: 150 });
  } else {
    localStorage.setItem(
      "buttonLayout",
      JSON.stringify(
        [...buttonsContainer.querySelectorAll("button")].map(
          (b) => b.textContent
        )
      )
    );
  }
};

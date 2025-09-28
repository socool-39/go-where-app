/***************
 * 設定區
 ***************/
const RAW_JSON_URL = "https://raw.githubusercontent.com/socool-39/go-where-app/main/places.json"; 
// ↑ 若你把檔名/路徑改了，記得換這個網址

// 類型 -> 細分類對照
const subtypeOptions = {
  "吃的": ["火鍋","烤肉","韓式","日式","中式","泰式","義式","早午餐","炸物","甜點","夜市","素食"],
  "喝的": ["咖啡","手搖","酒吧","茶館","果汁"],
  "玩的": ["景點","步道","展覽","電影院","桌遊","溫泉","密室逃脫","唱歌"],
  "休閒": ["公園","百貨","運動","書店","夜市"]
};

// 以 localStorage 為主的本地資料
let places = JSON.parse(localStorage.getItem("places") || "[]");

/***************
 * 工具：合併／儲存
 ***************/
// 避免重複：name + type + subtype + area 完全相同視為同一筆（同鍵則覆蓋）
function mergePlaces(newItems) {
  const key = p => [p.name||"", p.type||"", p.subtype||"", p.area||""].join("|");
  const map = new Map(places.map(p => [key(p), p]));
  for (const item of (newItems || [])) {
    map.set(key(item), { ...map.get(key(item)), ...item });
  }
  places = Array.from(map.values());
}

function saveLocal() {
  localStorage.setItem("places", JSON.stringify(places));
}

/***************
 * UI 渲染
 ***************/
function updatePlaceList() {
  const list = document.getElementById("placeList");
  list.innerHTML = "";
  places.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.name} (${p.type || "-"}${p.subtype ? ' / ' + p.subtype : ''} - ${p.area || "-"})
      <span>
        <button onclick="editPlace(${i})">✏️</button>
        <button onclick="deletePlace(${i})">🗑</button>
      </span>
    `;
    list.appendChild(li);
  });

  updateFilters();
}

function updateFilters() {
  const typeSet = new Set();
  const areaSet = new Set();

  places.forEach(p => {
    if (p.type) typeSet.add(p.type);
    if (p.area) areaSet.add(p.area);
  });

  const typeSelect = document.getElementById("filterType");
  const areaSelect = document.getElementById("filterArea");

  if (!typeSelect || !areaSelect) return;

  typeSelect.innerHTML = '<option value="">所有類型</option>';
  areaSelect.innerHTML = '<option value="">所有地區</option>';

  [...typeSet].sort().forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    typeSelect.appendChild(opt);
  });

  [...areaSet].sort().forEach(area => {
    const opt = document.createElement("option");
    opt.value = area;
    opt.textContent = area;
    areaSelect.appendChild(opt);
  });
}

/***************
 * 細分類連動
 ***************/
function populateSubtype(type) {
  const subSel = document.getElementById("placeSubtype");
  if (!subSel) return;

  const opts = subtypeOptions[type] || [];
  subSel.innerHTML = '<option value="">請選擇細分類</option>';

  if (opts.length > 0) {
    opts.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      subSel.appendChild(opt);
    });
    subSel.disabled = false;
    subSel.hidden = false;
  } else {
    subSel.disabled = true;
    subSel.hidden = true;
  }
}

/***************
 * CRUD（本地維護端）
 ***************/
function addPlace() {
  const name = document.getElementById("placeName").value.trim();
  const type = document.getElementById("placeType").value.trim();
  const subtype = (document.getElementById("placeSubtype")?.value || "").trim();
  const area = document.getElementById("placeArea").value.trim();

  if (!name) {
    alert("請輸入地點名稱！");
    return;
  }

  mergePlaces([{ name, type, subtype, area }]);
  saveLocal();
  updatePlaceList();

  document.getElementById("placeName").value = "";
  document.getElementById("placeType").value = "";
  const subSel = document.getElementById("placeSubtype");
  if (subSel) { subSel.value = ""; subSel.disabled = true; subSel.hidden = true; }
  document.getElementById("placeArea").value = "";

  alert("✅ 已新增地點！");
}

function deletePlace(index) {
  if (!confirm("確定要刪除嗎？")) return;
  places.splice(index, 1);
  saveLocal();
  updatePlaceList();
}

function editPlace(index) {
  const p = places[index];
  const newName = prompt("修改地點名稱：", p.name);
  if (newName === null) return;
  const newType = prompt("修改類型：", p.type ?? "");
  if (newType === null) return;
  const newSubtype = prompt("修改細分類（可留空）：", p.subtype ?? "");
  if (newSubtype === null) return;
  const newArea = prompt("修改地區：", p.area ?? "");
  if (newArea === null) return;

  places[index] = {
    ...p,
    name: newName.trim(),
    type: newType.trim(),
    subtype: newSubtype.trim(),
    area: newArea.trim()
  };
  saveLocal();
  updatePlaceList();
}

/***************
 * 隨機抽籤
 ***************/
function drawRandom() {
  if (places.length === 0) {
    alert("你還沒新增任何地點！");
    return;
  }

  const filterType = document.getElementById("filterType").value;
  const filterArea = document.getElementById("filterArea").value;

  const filtered = places.filter(p => {
    const typeMatch = !filterType || p.type === filterType;
    const areaMatch = !filterArea || p.area === filterArea;
    return typeMatch && areaMatch;
  });

  const result = document.getElementById("randomResult");
  result.classList.remove("show");

  if (filtered.length === 0) {
    result.textContent = "⚠️ 沒有符合條件的地點！";
    setTimeout(() => result.classList.add("show"), 50);
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[randomIndex];
  result.textContent = `👉 ${chosen.name}（${chosen.type || "-"}${chosen.subtype ? ' / ' + chosen.subtype : ''} - ${chosen.area || "-" }）`;

  setTimeout(() => result.classList.add("show"), 50);
}

/***************
 * 匯出 / 匯入（手動流程）
 ***************/
function exportPlaces() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-'); // 檔名帶時間戳
  const blob = new Blob([JSON.stringify(places, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `places-${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importPlaces(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("格式需為陣列");
      mergePlaces(imported);
      saveLocal();
      updatePlaceList();
      alert("✅ 匯入成功（檔案）！");
    } catch (err) {
      alert("⚠️ 匯入失敗，檔案格式錯誤");
    }
  };
  reader.readAsText(file);
}

/***************
 * 一鍵：從 GitHub Raw 匯入
 ***************/
async function importFromGitHub() {
  const btn = document.getElementById("btnImportRaw");
  const originalText = btn ? btn.textContent : "";
  try {
    if (btn) { btn.disabled = true; btn.textContent = "更新中…"; }

    const res = await fetch(RAW_JSON_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("下載失敗：" + res.status);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("內容格式需為陣列");

    const before = JSON.stringify(places);
    mergePlaces(data);
    const after = JSON.stringify(places);

    if (before !== after) {
      saveLocal();
      updatePlaceList();
      alert("✅ 已從 GitHub 更新完成！");
    } else {
      alert("ℹ️ 目前已是最新資料。");
    }
  } catch (e) {
    alert("⚠️ 從 GitHub 匯入失敗：\n" + (e?.message || e));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = originalText || "從 GitHub 取得最新資料"; }
  }
}

/***************
 * 初始化
 ***************/
window.addEventListener("load", () => {
  updatePlaceList(); // 以本地資料先渲染
  const typeSel = document.getElementById("placeType");
  if (typeSel) typeSel.addEventListener("change", (e) => populateSubtype(e.target.value));
});

let places = JSON.parse(localStorage.getItem("places") || "[]");

function updatePlaceList() {
  const list = document.getElementById("placeList");
  list.innerHTML = "";
  places.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.name} (${p.type} - ${p.area})
      <button onclick="editPlace(${i})">✏️</button>
      <button onclick="deletePlace(${i})">🗑</button>
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

function addPlace() {
  const name = document.getElementById("placeName").value.trim();
  const type = document.getElementById("placeType").value.trim();
  const area = document.getElementById("placeArea").value.trim();

  if (!name) {
    alert("請輸入地點名稱！");
    return;
  }

  places.push({ name, type, area });
  localStorage.setItem("places", JSON.stringify(places));
  updatePlaceList();

  document.getElementById("placeName").value = "";
  document.getElementById("placeType").value = "";
  document.getElementById("placeArea").value = "";

  alert("✅ 已新增地點！");
}

function deletePlace(index) {
  if (confirm("確定要刪除嗎？")) {
    places.splice(index, 1);
    localStorage.setItem("places", JSON.stringify(places));
    updatePlaceList();
  }
}

function editPlace(index) {
  const newName = prompt("修改地點名稱：", places[index].name);
  const newType = prompt("修改類型：", places[index].type);
  const newArea = prompt("修改地區：", places[index].area);

  if (newName) {
    places[index].name = newName.trim();
    places[index].type = newType.trim();
    places[index].area = newArea.trim();
    localStorage.setItem("places", JSON.stringify(places));
    updatePlaceList();
  }
}

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
  result.textContent = `👉 ${chosen.name}（${chosen.type} - ${chosen.area}）`;

  setTimeout(() => result.classList.add("show"), 50);
}

function exportPlaces() {
  const blob = new Blob([JSON.stringify(places, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "places.json";
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
      if (Array.isArray(imported)) {
        places = [...places, ...imported];
        localStorage.setItem("places", JSON.stringify(places));
        updatePlaceList();
        alert("✅ 匯入成功！");
      }
    } catch (err) {
      alert("⚠️ 匯入失敗，檔案格式錯誤");
    }
  };
  reader.readAsText(file);
}

// 初始化
updatePlaceList();

let places = JSON.parse(localStorage.getItem("places") || "[]");

function updatePlaceList() {
  const list = document.getElementById("placeList");
  list.innerHTML = "";
  places.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.type} - ${p.area})`;
    list.appendChild(li);
  });

  updateFilters(); // 更新篩選選單
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

  if (filtered.length === 0) {
    document.getElementById("randomResult").textContent = "⚠️ 沒有符合條件的地點！";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[randomIndex];
  document.getElementById("randomResult").textContent =
    `👉 ${chosen.name}（${chosen.type} - ${chosen.area}）`;
}

// 初始化
updatePlaceList();

// 儲存地點的地方
let places = JSON.parse(localStorage.getItem("places") || "[]");

function updatePlaceList() {
  const list = document.getElementById("placeList");
  list.innerHTML = "";
  places.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.type} - ${p.area})`;
    list.appendChild(li);
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
  const randomIndex = Math.floor(Math.random() * places.length);
  const chosen = places[randomIndex];
  document.getElementById("randomResult").textContent =
    `👉 ${chosen.name}（${chosen.type} - ${chosen.area}）`;
}

// 初始化清單
updatePlaceList();

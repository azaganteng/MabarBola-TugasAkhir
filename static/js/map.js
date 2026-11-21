const map = L.map("map").setView([-7.78, 110.38], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markers = L.layerGroup().addTo(map);
let selectedType = "Semua";
let searchTimer;

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function renderFields(fields) {
  const list = document.querySelector("#venue-list");
  const count = document.querySelector("#venue-count");
  count.textContent = fields.length;
  markers.clearLayers();
  list.innerHTML = "";

  if (!fields.length) {
    list.innerHTML = '<div class="empty">Lapangan tidak ditemukan.</div>';
    return;
  }

  fields.forEach((field) => {
    const marker = L.marker([field.latitude, field.longitude]).bindPopup(
      `<div class="popup-title">${escapeHtml(field.nama)}</div>` +
      `<div class="popup-address">${escapeHtml(field.alamat)}</div>`
    );
    marker.addTo(markers);

    const card = document.createElement("button");
    card.className = "venue-card";
    card.type = "button";
    card.innerHTML = `<div class="venue-top"><p class="venue-name">${escapeHtml(field.nama)}</p>` +
      `<span class="venue-type">${escapeHtml(field.jenis)}</span></div>` +
      `<p class="venue-address">${escapeHtml(field.alamat)}</p>`;
    card.addEventListener("click", () => {
      map.setView([field.latitude, field.longitude], 15);
      marker.openPopup();
    });
    list.appendChild(card);
  });
}

async function loadFields() {
  const query = new URLSearchParams({ jenis: selectedType });
  const search = document.querySelector("#search-input").value.trim();
  if (search) query.set("q", search);

  try {
    const response = await fetch(`/api/lapangan?${query}`);
    if (!response.ok) throw new Error("Gagal memuat data");
    renderFields(await response.json());
  } catch (error) {
    document.querySelector("#venue-list").innerHTML = '<div class="empty">Data lapangan gagal dimuat.</div>';
  }
}

document.querySelectorAll(".mini-filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mini-filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    selectedType = button.dataset.type;
    loadFields();
  });
});

document.querySelector("#search-input").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadFields, 250);
});

const locateButton = document.querySelector("#locate-button");
if (locateButton) {
  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [position.coords.latitude, position.coords.longitude];
        map.setView(location, 14);
        L.circleMarker(location, { radius: 8, color: "#174f38", fillColor: "#c9f36b", fillOpacity: 1 })
          .addTo(map).bindPopup("Lokasi kamu").openPopup();
      },
      () => alert("Lokasi tidak dapat diakses. Pastikan izin lokasi sudah diberikan.")
    );
  });
}

loadFields();

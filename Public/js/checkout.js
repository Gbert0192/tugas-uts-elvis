let map;
let userLocation;
let destinationMarkers = [];
let destinations = [];
let routingControl;

// Haversine Formula untuk menghitung jarak antara dua koordinat (dalam km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius Bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getUserAddress(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.display_name) {
        // Mengisi elemen input dengan ID 'user-address' dengan alamat
        document.getElementById("user-address").value = data.display_name;
      } else {
        alert("Gagal mendapatkan alamat.");
      }
    })
    .catch((e) => {
      // Menampilkan kesalahan secara lebih informatif
      alert("Terjadi kesalahan saat mengambil alamat: " + e.message);
    });
}

function initMap() {
  map = L.map("map").setView([0, 0], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = [position.coords.latitude, position.coords.longitude];
        map.setView(userLocation, 13);

        L.marker(userLocation)
          .addTo(map)
          .bindPopup("Lokasi Anda") // Label untuk lokasi pengguna
          .openPopup();
        getUserAddress(userLocation[0], userLocation[1]);
        generateRandomDestinations(1); // Menambahkan tujuan random
      },
      () => {
        alert("Gagal mendapatkan lokasi Anda.");
      }
    );
  }
}

// Fungsi untuk menggambar rute
function drawRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  if (userLocation && destinationMarkers.length > 0) {
    const waypoints = [
      L.latLng(userLocation[0], userLocation[1]),
      ...destinationMarkers.map((marker) => L.latLng(marker.getLatLng())),
    ];

    routingControl = L.Routing.control({
      waypoints,
      createMarker: () => null,
      routeWhileDragging: true,
    }).addTo(map);
  }
}

function generateRandomDestinations(count, minDistance = 1, maxDistance = 5) {
  for (let i = 0; i < count; i++) {
    let randomLat, randomLng, distance;
    do {
      randomLat =
        userLocation[0] +
        (Math.random() - 0.5) * (maxDistance - minDistance) * 2;
      randomLng =
        userLocation[1] +
        (Math.random() - 0.5) * (maxDistance - minDistance) * 2;

      distance = haversine(
        userLocation[0],
        userLocation[1],
        randomLat,
        randomLng
      );
    } while (distance < minDistance || distance > maxDistance); // Pastikan jarak antara 1km - 5km

    const label = `The Store ${i + 1}`;

    const marker = L.marker([randomLat, randomLng])
      .addTo(map)
      .bindPopup(label)
      .openPopup();

    destinationMarkers.push(marker);
    destinations.push({
      lat: randomLat,
      lng: randomLng,
      label,
      distance: distance, // Menyimpan jarak
    });

    const distanceElement = document.getElementById("distance");
    distanceElement.innerHTML = `Jarak ke tujuan: ${distance.toFixed(2)} km`;
  }
  drawRoute();
}

document.addEventListener("DOMContentLoaded", initMap);

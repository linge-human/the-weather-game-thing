const apiKey = "6733ae5a2bc2f3c3aa2793a8e4f84d7c";
const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '© OpenStreetMap contributors',
  detectRetina: true,
  maxZoom: 17,
  minZoom: 2
}).addTo(map);

const weatherBox = document.getElementById("weatherBox");
const closeWeather = document.getElementById("closeWeather");
const textSizeSlider = document.getElementById("textSizeSlider");

// Initialize weatherBox font size from slider default value
weatherBox.style.setProperty('--location-text-size', textSizeSlider.value + 'rem');
document.querySelector('#weatherBox h2')?.style.setProperty('font-size', textSizeSlider.value + 'rem');

// Slider input event changes the font size live
textSizeSlider.addEventListener("input", () => {
  if (weatherBox.style.display === "block") {
    const newSize = textSizeSlider.value + "rem";
    // Change font size of header inside weatherBox
    const header = weatherBox.querySelector("h2");
    if (header) {
      header.style.fontSize = newSize;
    }
  }
});

// Fetch and display weather on map click
map.on("click", async (e) => {
  const { lat, lng } = e.latlng;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

  weatherBox.style.display = "block";
  closeWeather.style.display = "block";
  weatherBox.innerHTML = `<p>Loading weather...</p>`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    if (data.cod !== 200) {
      weatherBox.innerHTML = `<p>No weather found for this spot.</p>`;
      return;
    }
    const { name } = data;
    const { country } = data.sys || {};
    const { temp, humidity } = data.main || {};
    const { description, icon } = (data.weather && data.weather[0]) || {};

    // Insert weather info
    weatherBox.innerHTML = `
      <h2 style="font-size:${textSizeSlider.value}rem">${name || "Unknown"}${country ? ", " + country : ""}</h2>
      ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">` : ""}
      ${description ? `<p style="text-transform:capitalize">${description}</p>` : ""}
      ${typeof temp === "number" ? `<p>🌡️ ${Math.round(temp)} °C</p>` : ""}
      ${typeof humidity === "number" ? `<p>💧 ${humidity}% humidity</p>` : ""}
    `;
  } catch (err) {
    weatherBox.innerHTML = `<p style="color:#f88">Failed to fetch weather.</p>`;
    console.error(err);
  }
});

// Hide box with button
closeWeather.onclick = () => {
  weatherBox.style.display = "none";
  closeWeather.style.display = "none";
};

// Hide weather box if user clicks outside
map.on("mousedown", () => {
  if (weatherBox.style.display === "block") {
    setTimeout(function() {
      if (!weatherBox.matches(":hover") && !closeWeather.matches(":hover"))
        closeWeather.click();
    }, 50);
  }
});

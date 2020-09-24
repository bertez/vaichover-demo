const permission = document.querySelector(".permission");
const positive = document.querySelector(".positive");
const negative = document.querySelector(".negative");
const error = document.querySelector(".error");

const API_KEY = "b585a674a8613d12661806e639357030";

function hideAllPanels() {
  permission.classList.add("hidden");
  positive.classList.add("hidden");
  negative.classList.add("hidden");
  error.classList.add("hidden");
}

function showPanel(panel) {
  panel.classList.remove("hidden");
}

async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) throw "Error conseguindo info do tempo";
  const data = await response.json();
  return data;
}

function showError(message) {
  hideAllPanels();
  error.querySelector("p").innerText = message;
  showPanel(error);
}

function showPositive(info) {
  hideAllPanels();
  showPanel(positive);
  positive.querySelector("p").innerHTML = `Agora mesmo hai ${
    info.currentTemp
  }°C en <strong>${info.location || "na túa localización"}</strong> con ${
    info.currentWeather
  } e parece que choverá <strong>dentro de ${info.nextRain} ${
    info.nextRain === 1 ? "hora" : "horas"
  }</strong>`;
}

function showNegative(info) {
  hideAllPanels();
  showPanel(negative);
  negative.querySelector("p").innerHTML = `Agora mesmo hai ${
    info.currentTemp
  }°C en <strong>${info.location || "na túa localización"}</strong> con ${
    info.currentWeather
  } e non parece que vaia a chover nas próximas horas`;
}

async function processLocation(location) {
  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;

  try {
    const current = await getData(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${API_KEY}&units=metric&lang=gl`
    );

    const next = await getData(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&APPID=${API_KEY}&units=metric&lang=gl&exclude=current,minutely,daily`
    );

    const nextRain = next.hourly.findIndex((hour) => {
      return hour.weather[0].main === "Rain";
    });

    if (nextRain > -1 && nextRain < 8) {
      showPositive({
        location: current.name,
        currentTemp: current.main.temp.toFixed(),
        currentWeather: current.weather[0].description,
        nextRain: nextRain + 1,
      });
    } else {
      showNegative({
        location: current.name,
        currentTemp: current.main.temp.toFixed(),
        currentWeather: current.weather[0].description,
      });
    }
  } catch (error) {
    showError("Erro conseguindo información meteorolóxica");
  }
}

function getUserLocation() {
  hideAllPanels();

  navigator.geolocation.getCurrentPosition(
    (locationInfo) => {
      localStorage.setItem("permission", "ok");
      processLocation(locationInfo);
    },
    () => {
      showError("Erro conseguindo localización");
    }
  );
}

function main() {
  showPanel(permission);

  if (localStorage.getItem("permission") === "ok") {
    getUserLocation();
  } else {
    permission.querySelector("button").onclick = () => getUserLocation();
  }
}

main();

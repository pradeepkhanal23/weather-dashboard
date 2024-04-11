// importing DOM elements
const searchBtn = document.getElementById("search-btn");
const cityInputEl = document.getElementById("city");
const resultsEl = document.getElementById("results");
const loader = document.querySelector(".loader");
const searchHistory = document.getElementById("search-cities");
const message = document.querySelector(".message");

let cities = JSON.parse(localStorage.getItem("cities"));
let activeButton = null;

const currentWeatherEl = document.getElementById("current-weather");
const forecastWeatherEl = document.getElementById("forecast-weather");

const apiKey = "af8e238d022ae49cfd547eb3a1338d5a";
const baseURL = "https://api.openweathermap.org/data/2.5";

function createWeatherCard(current, forecastsArray) {
  // Generating HTML for current weather
  let weatherHTML = `
    <article class="card" id="selected-city">
      <div class="card-body">
        <h2 class="card-title pb-2">${current.name} <span class="date">(9/13/2022)</span>
          <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="weather-icon"/>
        </h2>
        <p class="card-text"><span>Temp:</span> ${current.main.temp} F</p>
        <p class="card-text"><span>Wind:</span> ${current.wind.speed} MPH</p>
        <p class="card-text"><span>Humidity:</span> ${current.main.humidity}%</p>
      </div>
    </article>
  `;

  // Looping through forecastArray to generate forecast cards

  let forecastHTML = `
    <section class="mt-5 d-flex flex-column" id="5-day-forecast">
              <h3 class="forecast-title">5 day forecast</h3>
              <div class="forecast-cards">
  `;

  // Looping through forecastArray to generate forecast cards
  for (let i = 0; i < 5; i++) {
    const forecast = forecastsArray[i];

    forecastHTML += `
      <article class="card mb-2 forecast-card">
        <div class="card-body">
          <p class="card-text">10/12/2024</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather-icon"/>
          <p class="card-text"><span>Temp:</span> ${forecast.main.temp} F</p>
          <p class="card-text"><span>Wind:</span> ${forecast.wind.speed} MPH</p>
          <p class="card-text"><span>Humidity:</span> ${forecast.main.humidity}%</p>
        </div>
      </article>
    `;
  }

  // Closing forecast HTML section
  forecastHTML += `
      </div>
    </section>
  `;

  resultsEl.innerHTML = weatherHTML + forecastHTML;
}

function isArrayFull(arr) {
  if (arr.length >= 11) {
    return true;
  } else if (arr.length === null) {
    return false;
  } else {
    return false;
  }
}

function addToLocalStorage(city) {
  //we initialize and empty array if there is nothing in local storage
  if (cities === null) {
    cities = [];
  }
  //we then push the new entered city value to the cities array and store it again in the local storage
  cities.unshift(city);

  const full = isArrayFull(cities);

  if (full) {
    cities.pop();
    localStorage.setItem("cities", JSON.stringify(cities));
    return;
  }

  localStorage.setItem("cities", JSON.stringify(cities));
}

//fetch weather data function
async function fetchAPIEndpoint(city) {
  const weatherResponse = await fetch(
    `${baseURL}/weather?q=${city}&appid=${apiKey}`
  );
  const forecastResponse = await fetch(
    `${baseURL}/forecast?q=${city}&appid=${apiKey}`
  );

  // Check if the weather API request was successful
  if (weatherResponse.ok && forecastResponse.ok) {
    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();
    createWeatherCard(weatherData, forecastData.list);
  } else {
    message.textContent = `City '${city}' cannot be found, please enter a valid city name`;
    console.log(weatherResponse.error());
  }
}

function createButtonCard(city) {
  let capitalizedValue = city.charAt(0).toUpperCase() + city.slice(1);

  const button = document.createElement("button");
  button.classList.add("list-group-item");
  button.classList.add("list-group-item-action");
  button.classList.add("text-center");
  button.textContent = capitalizedValue;

  return button;
}

function updateCityList() {
  if (!cities) {
    return [];
  } else {
    searchHistory.innerHTML = "";
    let cities = JSON.parse(localStorage.getItem("cities"));
    cities.forEach((city) => {
      searchHistory.append(createButtonCard(city));
    });
  }
}

function handleSearch(event) {
  event.preventDefault();

  if (event.target.classList.contains("list-group-item")) {
    if (activeButton) {
      activeButton.classList.remove("active");
    }

    event.target.classList.add("active");

    activeButton = event.target;

    fetchAPIEndpoint(event.target.textContent);
  }
}

async function validateCity(city) {
  try {
    const response = await fetch(
      `${baseURL}/weather?q=${city}&appid=${apiKey}`
    );
    return response.ok;
  } catch (error) {
    console.error("Error validating city:", error);
    return false;
  }
}

//submit handle function
async function handleSubmit(event) {
  event.preventDefault();

  const city = cityInputEl.value.trim();

  if (!city) {
    alert("Please enter the city name");
    return;
  } else {
    const isValidCity = await validateCity(city);

    if (!isValidCity) {
      message.textContent = `Invalid city name '${city}'. Please enter a valid city name`;
      cityInputEl.value = "";
      return;
    }

    addToLocalStorage(city);

    //now creating a card button for that city value
    let cityButtonCard = createButtonCard(city);

    //appending that button card in the search history element
    searchHistory.append(cityButtonCard);

    //after that we start our fetching
    fetchAPIEndpoint(city);
    cityInputEl.value = "";

    updateCityList();
  }
}

async function success(pos) {
  const coordinates = pos.coords;

  let lat = coordinates.latitude;
  let lon = coordinates.longitude;

  const parseWeatherData = fetchWeatherDataFromStorage();
  if (parseWeatherData) {
    createWeatherCard(parseWeatherData.weather, parseWeatherData.forecast);
  }

  const currentWeatherResponse = await fetch(
    `${baseURL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );
  const currentForecastResponse = await fetch(
    `${baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );

  const currentLocation = await currentWeatherResponse.json();
  const currentForecast = await currentForecastResponse.json();

  localStorage.setItem(
    "weatherData",
    JSON.stringify({
      weather: currentLocation,
      forecast: currentForecast.list,
    })
  );

  createWeatherCard(currentLocation, currentForecast.list);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function locationHandler() {
  navigator.geolocation.getCurrentPosition(success, error);
}

function fetchWeatherDataFromStorage() {
  let weatherData = JSON.parse(localStorage.getItem("weatherData"));
  return weatherData;
}

//event handles called here
searchBtn.addEventListener("click", handleSubmit);
searchHistory.addEventListener("click", handleSearch);
updateCityList();
locationHandler();
fetchWeatherDataFromStorage();

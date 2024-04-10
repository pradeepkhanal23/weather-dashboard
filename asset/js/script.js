// importing DOM elements
const searchBtn = document.getElementById("search-btn");
const cityInputEl = document.getElementById("city");
const resultsEl = document.getElementById("results");

function createWeatherCard(current, forecastsArray) {
  // Generating HTML for current weather
  const currentWeatherHTML = `
    <section class="card" id="selected-city">
      <div class="card-body">
        <h2 class="card-title pb-2">${current.name} <span class="date">(9/13/2022)</span>
          <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="weather-icon"/>
        </h2>
        <p class="card-text"><span>Temp:</span> ${current.main.temp} F</p>
        <p class="card-text"><span>Wind:</span> ${current.wind.speed} MPH</p>
        <p class="card-text"><span>Humidity:</span> ${current.main.humidity}%</p>
      </div>
    </section>
  `;

  // Generating HTML for 5-day forecast
  let forecastHTML = `
    <section class="mt-5 d-flex flex-column" id="5-day-forecast">
      <h3 class="forecast-title">5-Day Forecasts</h3>
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

  // Combining current weather and forecast HTML and displaying it in resultsEl
  resultsEl.innerHTML = currentWeatherHTML + forecastHTML;
}

//fetch weather data function
async function fetchAPIEndpoint(city) {
  const apiKey = "af8e238d022ae49cfd547eb3a1338d5a";
  const baseURL = "https://api.openweathermap.org/data/2.5";

  const weatherResponse = await fetch(
    `${baseURL}/weather?q=${city}&appid=${apiKey}`
  );
  const forecastResponse = await fetch(
    `${baseURL}/forecast?q=${city}&appid=${apiKey}`
  );
  const weatherData = await weatherResponse.json();
  const forecastData = await forecastResponse.json();

  createWeatherCard(weatherData, forecastData.list);
}

//submit handle function
function handleSubmit(event) {
  event.preventDefault();

  const city = cityInputEl.value;

  if (!city) {
    alert("Please enter the city name");
  } else {
    fetchAPIEndpoint(city);
    city.value = "";
  }
}

//event handles called here
function eventHandlers() {
  searchBtn.addEventListener("click", handleSubmit);
}

function init() {
  eventHandlers();
}

init();

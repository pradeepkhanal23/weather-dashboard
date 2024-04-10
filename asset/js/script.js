// importing DOM elements
const searchBtn = document.getElementById("search-btn");
const cityInputEl = document.getElementById("city");

function displayWeatherInfo() {}

//fetch weather data function
async function fetchAPIEndpoint(city) {
  const apiKey = "af8e238d022ae49cfd547eb3a1338d5a";
  const baseURL = "https://api.openweathermap.org/data/2.5/weather";

  const response = await fetch(`${baseURL}?q=${city}&appid=${apiKey}`);
  const data = await response.json();

  displayWeatherInfo(data);
}

//submit handle function
function handleSubmit(event) {
  event.preventDefault();

  const city = cityInputEl.value;

  if (!city) {
    alert("Please enter the city name");
  } else {
    fetchAPIEndpoint(city);
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

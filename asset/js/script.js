// importing DOM elements
const searchBtn = document.getElementById("search-btn");
const cityInputEl = document.getElementById("city");
const loader = document.querySelector(".loader");
const searchHistory = document.getElementById("search-cities");
const currentWeatherEl = document.getElementById("current-weather");
const forecastWeatherEl = document.getElementById("forecast-weather");
let resultsEl = document.getElementById("results");
let message = document.querySelector(".message");

//parsing the storage item while fetching from the storage
let cities = JSON.parse(localStorage.getItem("cities"));

//initializing the active button as null to begin with
let activeButton = null;

// api key and base url globally declared
const apiKey = "af8e238d022ae49cfd547eb3a1338d5a";
const baseURL = "https://api.openweathermap.org/data/2.5";

//getting the time in real time
let today = new Date();
let now = {
  year: today.getFullYear(),
  month: today.getMonth() + 1, //because the month is 0 index, we added 1 to make it in order
  day: today.getDate(),
};

//formatting the date as user required
const formattedDate = `${now.day}/${now.month}/${now.year}`;

//function that creates the current weather and forecast weather cards respectively
function createWeatherCard(current, forecastsArray) {
  // Generating HTML for current weather
  let weatherHTML = `
    <article class="card border border-2" id="selected-city">
      <div class="card-body">
        <h2 class="card-title pb-2">${current.name} <span class="date">${formattedDate}</span>
          <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="weather-icon"/>
        </h2>
        <p class="card-text"><span>Temp:</span> ${current.main.temp}°F</p>
        <p class="card-text"><span>Wind:</span> ${current.wind.speed} MPH</p>
        <p class="card-text"><span>Humidity:</span> ${current.main.humidity}%</p>
      </div>
    </article>
  `;

  // Looping through forecastArray to generate forecast cards

  let forecastHTML = `
    <section class="mt-5 d-flex flex-column" id="5-day-forecast">
              <h3 class="forecast-title">5 days forecast:</h3>
              <div class="forecast-cards">
  `;

  // Looping through forecastArray to generate forecast cards
  for (let i = 0; i < 5; i++) {
    const forecast = forecastsArray[i];

    //changing the date of the forecast card for user to identify the weather on a specific date or day.
    now = {
      year: today.getFullYear(),
      month: today.getMonth() + 1, //because the month is 0 index, we added 1 to make it in order
      day: today.getDate() + i + 1, // the array is 0 based so so we added 1 to make it start from 1
    };

    //forecast date format
    const formattedForecastDate = `${now.day}/${now.month}/${now.year}`;

    forecastHTML += `
      <article class="card mb-2 forecast-card">
        <div class="card-body">
          <p class="card-text">${formattedForecastDate}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather-icon"/>
          <p class="card-text"><span>Temp:</span> ${forecast.main.temp}°F</p>
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

  //finally appending both the weather and forecast in the main results elements for DOM display
  resultsEl.innerHTML = weatherHTML + forecastHTML;
}

// function to check if the array is full (the max array value can be changed based on requirements)
function isArrayFull(arr) {
  if (arr.length >= 12) {
    return true;
  } else if (arr.length === null) {
    return false;
  } else {
    return false;
  }
}

// function to add the user input city to the local storage
function addToLocalStorage(city) {
  //we initialize and empty array if there is nothing in local storage
  if (cities === null) {
    cities = [];
  }
  //we then push the new entered city value at the beginning of the cities array and store it again in the local storage
  cities.unshift(city);

  //checking if array is full ,because we wanna show only limited search history
  const full = isArrayFull(cities);

  //if array is full we are popping the last one out to maintain the maximum allowed search history
  if (full) {
    cities.pop();
    localStorage.setItem("cities", JSON.stringify(cities));
    return;
  }

  //seting the value to the local storage
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

// dynamically creating search history button card for quick fetch and returning it
function createButtonCard(city) {
  let capitalizedValue = city.charAt(0).toUpperCase() + city.slice(1);

  const button = document.createElement("button");
  button.classList.add("list-group-item");
  button.classList.add("list-group-item-action");
  button.classList.add("text-center");
  button.textContent = capitalizedValue;

  return button;
}

// this method helps to render the search list, eveytime its cleared and re-repainted to see the latest change in the array
function renderSearchHistory() {
  if (!cities) {
    return [];
  } else {
    searchHistory.innerHTML = "";
    let cities = JSON.parse(localStorage.getItem("cities"));
    cities = new Set(cities); // js Set() object has been used to prevent the duplicated values, by doing this,only the unique value will be stored

    //now we are looping over the cities array and adding each to the DOM
    cities.forEach((city) => {
      searchHistory.append(createButtonCard(city));
    });
  }
}

//function to handle the search operation
function handleSearch(event) {
  event.preventDefault();

  if (event.target.classList.contains("list-group-item")) {
    // if there was an active button before, we remove the "current" class from it and add it to the newly selected button for better user experience
    if (activeButton) {
      activeButton.classList.remove("current");
    }

    event.target.classList.add("current");

    //the clicked button is set as the active button and different style is applied
    activeButton = event.target;

    //now the fetching is triggered based on the clicked button
    fetchAPIEndpoint(event.target.textContent);
  }
}

//because not all the city names are valid input for the api, we added an extra check for valid city and display the error message as needed
async function validateCity(city) {
  try {
    const response = await fetch(
      `${baseURL}/weather?q=${city}&appid=${apiKey}`
    );
    return response.ok;
  } catch (error) {
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

    //once the city is added in the input, its also displayed in the list instantly
    renderSearchHistory();
  }
}

// callback function that is invoked if the request is succesfull
async function success(pos) {
  const coordinates = pos.coords;

  //getting the lattitude and longitude
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

  //setting the current location value to the local storage
  localStorage.setItem(
    "weatherData",
    JSON.stringify({
      weather: currentLocation,
      forecast: currentForecast.list,
    })
  );

  createWeatherCard(currentLocation, currentForecast.list);
}

// this callback function is executed in case it fails to fetch via geolocation api
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//handler function that is called on geolocation api
function locationHandler() {
  navigator.geolocation.getCurrentPosition(success, error);
}

//fetching the data from the storage
function fetchWeatherDataFromStorage() {
  let weatherData = JSON.parse(localStorage.getItem("weatherData"));
  return weatherData;
}

//event handles called here
searchBtn.addEventListener("click", handleSubmit);
searchHistory.addEventListener("click", handleSearch);

//imp function calls for the application to work
renderSearchHistory();
locationHandler();
fetchWeatherDataFromStorage();

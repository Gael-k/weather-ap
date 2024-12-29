const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');
const apiKey = '1764725cf4acb2b623feb3d307894531';

// Event Listeners
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Fetch Data from API
async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Fetch Error:', error);
        return null;
    }
}

// Update Weather Info
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    if (!weatherData || weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: cityName,
        sys: { country },
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
    } = weatherData;

    countryTxt.textContent = `${cityName}, ${country}`;
    tempTxt.textContent = `${Math.round(temp)} ℃`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} m/s`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

// Get Weather Icon
function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg';
    if (id >= 300 && id <= 321) return 'drizzle.svg';
    if (id >= 500 && id <= 531) return 'rain.svg';
    if (id >= 600 && id <= 622) return 'snow.svg';
    if (id >= 701 && id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

// Get Current Date
function getCurrentDate() {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });
}

// Update Forecast Info
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    if (!forecastsData) return;

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';
    forecastsData.list.forEach((forecastWeather) => {
        if (
            forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastItems(forecastWeather);
        }
    });
}

// Update Forecast Items
function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp },
    } = weatherData;

    const dateTaken = new Date(date);
    const dateResult = dateTaken.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
    });

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} ℃</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Show Display Section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(
        (sec) => (sec.style.display = 'none')
    );
    section.style.display = 'flex';
}



// -----------------------
const suggestionsList = document.querySelector('.suggestions-list');


// Fetch suggestions from API
async function fetchSuggestions(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Handle input event
cityInput.addEventListener('input', async () => {
    const query = cityInput.value.trim();
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    if (!query) {
        suggestionsList.style.display = 'none';
        return;
    }

    // Fetch and display suggestions
    const locations = await fetchSuggestions(query);

    if (locations.length > 0) {
        locations.forEach((location) => {
            const listItem = document.createElement('li');
            const displayName = `${location.name}, ${location.country}`;
            listItem.textContent = displayName;

            // Set input value when a suggestion is clicked
            listItem.addEventListener('click', () => {
                cityInput.value = displayName;
                suggestionsList.style.display = 'none'; // Hide suggestions
            });

            suggestionsList.appendChild(listItem);
        });
        suggestionsList.style.display = 'block'; // Show suggestions
    } else {
        suggestionsList.style.display = 'none'; // Hide if no matches
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!cityInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

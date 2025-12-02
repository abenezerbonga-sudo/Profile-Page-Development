// --- Part 3: Current Weather using OpenWeatherMap API ---

// IMPORTANT: Replace the placeholder values below with your actual data.
// You must get a free API Key from OpenWeatherMap.org to make this work.
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY_HERE"; 
const CITY_NAME = "San Jose"; 
const UNITS = "imperial"; // Use 'imperial' for Fahrenheit or 'metric' for Celsius

const weatherDisplay = document.getElementById('weather-display');

/**
 * Retries an asynchronous function with exponential backoff on failure.
 * @param {Function} fn - The function to execute.
 * @param {number} retriesLeft - The number of retries remaining.
 * @param {number} delay - The current delay in milliseconds.
 */
async function retryOperation(fn, retriesLeft = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryOperation(fn, retriesLeft - 1, delay * 2);
        } else {
            throw error; // If no retries left, throw the final error
        }
    }
}

/**
 * Fetches and displays the current weather data for the specified city.
 */
async function getWeatherData() {
    if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY_HERE") {
         weatherDisplay.innerHTML = `
            <p class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                <strong>API Key Missing:</strong> Please replace 'YOUR_OPENWEATHERMAP_API_KEY_HERE' in weather.js with your actual OpenWeatherMap API key.
            </p>
        `;
        return; // Stop execution if key is not set
    }
    
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}&units=${UNITS}`;
    const tempUnit = UNITS === 'imperial' ? 'F' : 'C';

    try {
        const fetchFn = async () => {
            const response = await fetch(API_URL);

            if (!response.ok) {
                // If response status is not successful, throw an error
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            return response.json();
        };

        const data = await retryOperation(fetchFn);

        // Process and Display Data
        const cityName = data.name;
        const temperature = data.main.temp.toFixed(1);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed.toFixed(1);

        // Construct the display using an official OpenWeatherMap icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        weatherDisplay.innerHTML = `
            <div class="weather-content">
                <div class="weather-main">
                    <img src="${iconUrl}" alt="${description}" class="weather-icon">
                    <h3>${cityName}</h3>
                    <p class="temp">${temperature}°${tempUnit}</p>
                </div>
                <div class="weather-details">
                    <p><strong>Conditions:</strong> ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
                    <p><strong>Humidity:</strong> ${humidity}%</p>
                    <p><strong>Wind Speed:</strong> ${windSpeed} ${UNITS === 'imperial' ? 'mph' : 'm/s'}</p>
                </div>
            </div>
        `;

    } catch (error) {
        // Error Handling (Good Practice)
        console.error("Failed to fetch weather data after multiple retries:", error);
        weatherDisplay.innerHTML = `
            <p class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                Could not load weather data for ${CITY_NAME}. Error: ${error.message}.
                Please ensure your API key is correct and valid.
            </p>
        `;
    }
}

// Start fetching data
getWeatherData();
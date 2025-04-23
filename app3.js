// Authorised API key
const apikey = "add_your_api key_generated_from_openweathermap.org";
// API URL for current weather
const apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
// API URL for 5-day forecast
const newapi = "https://api.openweathermap.org/data/2.5/forecast?";

// Get elements
const searchBtn = document.getElementById("search-btn");
const inputCity = document.getElementById("location");

// Convert UTC datetime to IST formatted time
function convertUTCToIST(dt_txt) {
    const date = new Date(dt_txt + " UTC");
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata"
    });
}

// Convert to IST date object
function toISTDateObject(dt_txt) {
    const date = new Date(dt_txt + " UTC");
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

// Fetch current weather and forecast
async function search(city) {
    try {
        const response = await fetch(`${apiurl}&q=${city}&appid=${apikey}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found");
            return;
        }

        displayCurrentWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    document.getElementById("city-name").innerText = data.name;
    document.getElementById("temperature").innerText = `Temperature: ${data.main.temp.toFixed(1)} °C`;
    document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind-speed").innerText = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById("condition").innerText = `Condition: ${data.weather[0].description}`;
    document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

// Fetch and process forecast data
async function fetchForecast(lat, lon) {
    const forecastResponse = await fetch(`${newapi}lat=${lat}&lon=${lon}&units=metric&appid=${apikey}`);
    const forecastData = await forecastResponse.json();

    displayForecastButtons(forecastData.list);

    // Display today's forecast in IST
    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const todayForecast = forecastData.list.filter(item => {
        const istDate = toISTDateObject(item.dt_txt);
        return istDate.toLocaleDateString("en-CA") === todayIST;
    });

    displayForecast(todayForecast);
}

// Create forecast day buttons (in IST)
function displayForecastButtons(forecastList) {
    const forecastButtons = document.getElementById("forecast-buttons");
    forecastButtons.innerHTML = "";

    const forecastDays = {};
    forecastList.forEach(item => {
        const date = toISTDateObject(item.dt_txt).toLocaleDateString("en-CA");
        if (!forecastDays[date]) {
            forecastDays[date] = [];
        }
        forecastDays[date].push(item);
    });

    Object.keys(forecastDays).forEach(date => {
        const btn = document.createElement("button");
        const readableDate = new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short"
        });
        btn.innerText = readableDate;
        btn.className = "btn btn-outline-light mx-2";
        btn.addEventListener("click", () => {
            displayForecast(forecastDays[date]);
        });
        forecastButtons.appendChild(btn);
    });
}

// Find forecast entry closest to 12 PM IST
function getNoonISTForecast(forecastList) {
    const targetHour = 12; // 12 PM IST
    return forecastList.find(item => {
        const date = toISTDateObject(item.dt_txt);
        return date.getHours() === targetHour;
    }) || forecastList[0];
}

// Display hourly forecast
function displayForecast(forecast) {
    const forecastContainer = document.getElementById("hourly-forecast");
    forecastContainer.innerHTML = "";

    if (forecast.length > 0) {
        const daySummary = getNoonISTForecast(forecast);
        document.getElementById("temperature").innerText = `Temperature: ${daySummary.main.temp.toFixed(1)} °C`;
        document.getElementById("humidity").innerText = `Humidity: ${daySummary.main.humidity}%`;
        document.getElementById("wind-speed").innerText = `Wind Speed: ${daySummary.wind.speed} m/s`;
        document.getElementById("condition").innerText = `Condition: ${daySummary.weather[0].description}`;
        document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${daySummary.weather[0].icon}.png`;
    }

    const table = document.createElement("table");
    table.className = "forecast-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th> Time (IST)</th>
            <th>Temp (°C)</th>
            <th>Sky</th>
            <th>Feels Like</th>
            <th>Humidity</th>
            <th>Wind</th>
            <th>Pressure</th>
            <th>Icon</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    forecast.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${convertUTCToIST(item.dt_txt)}</td>
            <td>${item.main.temp.toFixed(1)} °C</td>
            <td>${item.weather[0].description}</td>
            <td>${item.main.feels_like.toFixed(1)} °C</td>
            <td>${item.main.humidity}%</td>
            <td>${item.wind.speed} m/s</td>
            <td>${item.main.pressure} hPa</td>
            <td><img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Icon" width="40" height="40"></td>
        `;

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    forecastContainer.appendChild(table);
}

// Event listeners
searchBtn.addEventListener("click", () => {
    if (inputCity.value.trim() !== "") {
        search(inputCity.value.trim());
    } else {
        alert("Please enter a city name");
    }
});

inputCity.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && inputCity.value.trim() !== "") {
        search(inputCity.value.trim());
    }
});

// Initial load with default city
search("Delhi");

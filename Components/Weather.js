async function getWeather() {
    // Get the current position of the user
    if (navigator.geolocation) {
        const lat = 56.394993;
        const lon = -3.430838;

        // Fetch the weather data from the server
        const response = await fetch(`http://fb21.decoded.com:8000/api/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error("Network response was not okay.");
        }
        const weatherData = await response.json();
        console.log("Current weather:", weatherData);

        switch (weatherData.condition) {
            case "clear sky":
        }
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

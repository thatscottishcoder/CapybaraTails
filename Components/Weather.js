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
        console.log(weatherData);
        console.log(weatherData.condition);

        const weather = "rain";

        switch (weather /*weatherData.condition*/) {
            case "clear sky":
                clearSky();
                break;
            case "few clouds":
                clouds(3);
                break;
            case "scattered clouds":
                clouds(5);
                break;
            case "broken clouds":
                clouds(8);
                break;
            case "shower rain":
                rain(50);
                break;
            case "light rain":
                rain(125);
            case "rain":
                rain(250);
                break;
            case "thunderstorm":
                rain(500);
                break;
            case "heavy intensity rain":
                rain(750);
                break;
            default:
                console.log("The weather is:", weatherData.condition);
                break;
        }
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function clouds(numClouds) {
    const link = document.createElement("link");
    link.setAttribute("href", "styles/Clouds.css");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    document.getElementsByTagName("head").item(0).appendChild(link);

    const body = document.body;
    const cloudsContainer = document.createElement("div");
    cloudsContainer.classList.add("clouds");

    for (var i = 0; i <= numClouds; i++) {
        const cloud = document.createElement("div");
        cloud.classList.add("cloud");
        cloud.id = `cloud${i}`;
        cloudsContainer.appendChild(cloud);

        const topPosition = Math.random() * 80 + 10;
        const leftPosition = Math.random() * 100 - 200;
        cloud.style.top = `${topPosition}%`;
        cloud.style.left = `${leftPosition}px`;
    }

    body.appendChild(cloudsContainer);

    const cloudElements = document.querySelectorAll(".cloud");
    cloudElements.forEach((c) => {
        c.style.animationDuration = `${Math.random() * 20 + 20}s`;
    });
}

function rain(numDrops) {
    function randRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const link = document.createElement("link");
    link.setAttribute("href", "styles/Rain.css");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    document.getElementsByTagName("head").item(0).appendChild(link);

    const body = document.body;
    const rainContainer = document.createElement("div");
    rainContainer.classList.add("rain");

    for (var i = 0; i < numDrops; i++) {
        const drop = document.createElement("div");
        const dropLeft = randRange(0, 2000);
        const dropTop = randRange(-1000, 1400);

        drop.classList.add("drop");
        drop.id = `drop${i}`;
        drop.style.left = `${dropLeft}px`;
        drop.style.top = `${dropTop}px`;

        rainContainer.append(drop);
    }

    body.appendChild(rainContainer);
}

function clearSky() {
    const link = document.createElement("link");
    link.setAttribute("href", "styles/ClearSky.css");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    document.getElementsByTagName("head").item(0).appendChild(link);

    const body = document.body;
    const clearSky = document.createElement("div");
    clearSky.id = "clear-sky";

    const sun = document.createElement("sun");
    sun.id = "sun";
    clearSky.appendChild(sun);
    body.appendChild(clearSky);
}

document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityName = document.getElementById('city-name');
    const country = document.getElementById('country');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weather-icon');
    const description = document.getElementById('description');
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const weatherData = document.getElementById('weather-data');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');

    // Clé API (dans un environnement de production, cette clé devrait être sécurisée côté serveur)
    const apiKey = 'c2cec64a6d2e57a5c2fa31baa6be53c2'; // Clé OpenWeatherMap gratuite pour démo

    // Fonction pour obtenir les données météo
    const getWeatherData = async (city) => {
        // Afficher le loader
        loader.classList.remove('hidden');
        weatherData.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=fr`
            );

            if (!response.ok) {
                throw new Error('Ville non trouvée');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        } finally {
            // Cacher le loader quelle que soit l'issue
            loader.classList.add('hidden');
        }
    };

    // Fonction pour afficher les données météo
    const displayWeatherData = (data) => {
        cityName.textContent = data.name;
        country.textContent = data.sys.country;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description;
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Conversion de m/s en km/h
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // Afficher les données météo
        weatherData.classList.remove('hidden');
    };

    // Fonction pour rechercher la météo
    const searchWeather = async () => {
        const city = cityInput.value.trim();

        if (city === '') {
            showError('Veuillez entrer le nom d\'une ville');
            return;
        }

        try {
            const data = await getWeatherData(city);
            displayWeatherData(data);
        } catch (error) {
            showError('Ville non trouvée. Veuillez vérifier l\'orthographe.');
        }
    };

    // Fonction pour afficher une erreur
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        weatherData.classList.add('hidden');
    };

    // Écouteurs d'événements
    searchButton.addEventListener('click', searchWeather);
    
    cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchWeather();
        }
    });

    // Recherche automatique si le navigateur prend en charge la géolocalisation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                loader.classList.remove('hidden');
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=fr`
                );
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }
                
                const data = await response.json();
                displayWeatherData(data);
            } catch (error) {
                console.error('Erreur de géolocalisation:', error);
                // Ne pas afficher d'erreur à l'utilisateur, simplement attendre qu'il entre une ville
                loader.classList.add('hidden');
            }
        }, () => {
            // En cas d'erreur ou de refus de géolocalisation
            loader.classList.add('hidden');
            // Ne pas afficher d'erreur, simplement attendre que l'utilisateur entre une ville
        });
    }
});
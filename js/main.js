// import API
import OpenWeatherAPIKey from "./apis.js";
const token = OpenWeatherAPIKey();
window.onload = function () {
    const savedLocation = JSON.parse(localStorage.getItem('savedLocation'));
    console.log(savedLocation)
    if(!savedLocation)
    {
        displayWeather('New York');
    }else if (!displayWeather(savedLocation.name))
    {
    displayGeoWeather(savedLocation.coord.lat,savedLocation.coord.lon)
    }   
}
const fetchWeather = async (city) => {
    const cityWeatherObj = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${token}&units=imperial`);
    const weatherJson = await cityWeatherObj.json();
    return weatherJson;  
}

const displayWeather = async (city) => {
    // pull data from fetch function
    const data = await fetchWeather(`${city}`);
    // Grab HTML elements
    const currentWeather = document.getElementById("currentWeather");
    const cityAndDate = document.querySelector(".cityName");
    const time = new Date(data.dt * 1000);

    // Fill HTML elements
    // Set date
    cityAndDate.innerHTML = `${data.name}, ${data.sys.country} <p>${time.toDateString()}</p>`;

    // Fill current weather
    currentWeather.innerHTML = `<p class="weatherHeading">Today's weather: </p><p class="temp">${data.main.temp.toFixed(0)}° F</p><img class="wIcons" src = "http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}"><p>${data.weather[0].description}</p><p>Low: ${data.main.temp_min.toFixed(0)}°</p><p>High: ${data.main.temp_max.toFixed(0)}°</p><p>Wind: ${data.wind.speed.toFixed(0)} mph</p>`
console.log(data)
    //Fill 5 day Forecast
    fiveDayFetch(data);
    setCity(data);
}

const fetchGeoWeather = async (lat,lon) => {
    const locationWeatherObj = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${token}&units=imperial`);
    const locWeatherJson = await locationWeatherObj.json();
    return locWeatherJson;
}

const displayGeoWeather = async (lat,lon) => {
    const data = await fetchGeoWeather(lat,lon);
    const currentWeather = document.getElementById("currentWeather");
    const cityAndDate = document.querySelector(".cityName");
    cityAndDate.innerHTML = `${data.name}`;
    const time = new Date(data.dt * 1000);
    cityAndDate.innerHTML = `${data.name}, ${data.sys.country} <p>${time.toDateString()}</p>`;
    currentWeather.innerHTML = `<p class="weatherHeading">Today's weather: </p><p class="temp">${data.main.temp.toFixed(0)}° F</p><img class="wIcons" src = "http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}"><p>${data.weather[0].main}</p><p>Low: ${data.main.temp_min.toFixed(0)}° </p><p>High: ${data.main.temp_max.toFixed(0)}°</p><p>Wind: ${data.wind.speed.toFixed(0)} mph</p>`
    
    fiveDayFetch(data);
    setCity(data);


}

const input = document.getElementById("citySearchButton");
input.addEventListener("click", (event) =>
{
event.preventDefault();
const cityName = document.getElementById("cityEntry").value;

    fetchWeather(cityName)
    .then(function (obj) {
        if (obj.cod != "200")
        {
            alert("Invalid city entered. Please try again");
            document.getElementById("cityEntry").value = '';
        }
        else {
            displayWeather(cityName);
            document.getElementById("cityEntry").value = '';
        }
    }).catch (function(error){
        console.log(error);
    })
});


document.getElementById("cityEntry").addEventListener("keyup", (event) =>
{
    event.preventDefault();
    if (event.key === 'Enter')
    {
        input.click();
    }
})


const locateMe = document.getElementById("locateButton");
locateMe.addEventListener("click", (event) =>
{
        event.preventDefault();
        navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        fetchGeoWeather(lat,lon);
        displayGeoWeather(lat,lon);})

})

const fiveDayFetch = async (data) =>
{
const APIcall = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=current,minutely,hourly,alerts&appid=${token}&units=imperial`)
const response = await APIcall.json();

fillFiveDay(response);
return response;
}

const fillFiveDay = async (data) =>{
const dayArray = [];
for (let i = 0; i < 6; i++) {
    const fiveDayTime = new Date(data.daily[i].dt * 1000);
    dayArray.push(fiveDayTime.toDateString().substring(0,3));
    for (let index = 1; index < 6; index++) {
        const element = dayArray[index];
        document.getElementById(`day${index}`).innerHTML = `<p class="days">${element}</p><p class="temp">${data.daily[index].temp.day.toFixed(0)}° F</p><img class="wIcons" src = "http://openweathermap.org/img/wn/${data.daily[index].weather[0].icon}@2x.png" alt="${data.daily[index].weather[0].description}"><p>${data.daily[index].weather[0].description}</p><p>Low: ${data.daily[index].temp.min.toFixed(0)}°</p><p>High: ${data.daily[index].temp.max.toFixed(0)}°</p><p>Wind: ${data.daily[index].wind_speed.toFixed(0)} mph</p>`;
    }
}
}



const setCity = async (location) =>
{
    const saveButton = document.getElementById("setDefaultCity");
    saveButton.addEventListener("click", (event) =>
    {
        localStorage.setItem('savedLocation', JSON.stringify((location)));
        saveButton.innerHTML = `City saved!`
        setTimeout(() => {
            saveButton.innerHTML = `Set as default city`;
        }, 3000);
    })

}

    

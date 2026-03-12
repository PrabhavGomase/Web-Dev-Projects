// Add your OpenWeather API key here
const apiKey = "YOUR_API_KEY_HERE";

const cityInput = document.getElementById("cityInput")
const searchBtn = document.getElementById("searchBtn")

const city = document.getElementById("city")
const temp = document.getElementById("temp")
const condition = document.getElementById("condition")

const humidity = document.getElementById("humidity")
const wind = document.getElementById("wind")
const pressure = document.getElementById("pressure")
const feels = document.getElementById("feels")

const weatherContainer = document.getElementById("weatherContainer")
const message = document.getElementById("message")

async function getWeather(cityName){

message.innerText=""

try{

const response = await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
)

if(!response.ok){
throw new Error("City not found")
}

const data = await response.json()

city.innerText = data.name
temp.innerText = Math.round(data.main.temp)
condition.innerText = data.weather[0].main

humidity.innerText = data.main.humidity + "%"
wind.innerText = data.wind.speed + " km/h"
pressure.innerText = data.main.pressure + " hPa"
feels.innerText = Math.round(data.main.feels_like) + "°C"

weatherContainer.classList.remove("hidden")

cityInput.value=""

}
catch(error){
message.innerText="City not found. Please try again."
}

}

searchBtn.onclick = ()=>{
const cityName = cityInput.value.trim()

if(cityName===""){
message.innerText="Please enter a city name."
return
}

getWeather(cityName)
}

cityInput.addEventListener("keypress",function(e){
if(e.key==="Enter"){
searchBtn.click()
}
})

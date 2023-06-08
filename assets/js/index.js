var weatherURL = 'https://api.openweathermap.org/data/3.0/onecall?'
var APIkey = 'appid=5a2b8d33311dc86fb5608e194db81f27';
var lon;
var lat;
var searchLocation;
var eventResult;
const iconURLprefix = 'http://openweathermap.org/img/wn/';


// Grab necessary elements
var userLocation = $('#search-location');
var mapModal = $('#mapModal');
var suggestionsBtn = $('#suggestionsBtn');
var localWeather = $('.local-weather')


// Options for getting user location
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

// Modal display with map API within it, uses bootstrap but can substitute for tailwind
function displayModal() {
    mapModal.modal('show');
}

// Display the map within the modal
function generateMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhc2N1bmEiLCJhIjoiY2xkanU2MXl1MHVuaDN3bm9oOGZqMzVsMSJ9.slPE4Rn2asrbxWKcDgBejA';
    navigator.geolocation.getCurrentPosition(success, error, options);
    const map = new mapboxgl.Map({
    container: 'map',
     // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
     style: 'mapbox://styles/mapbox/streets-v12',
     center: [-100,40],
     zoom: 3
    });
 
    const geocoder = new MapboxGeocoder({
     accessToken: mapboxgl.accessToken,
     mapboxgl: mapboxgl
    });

    // Add the control to the map.
    map.addControl(geocoder,'top-left');

    map.addControl(
     new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
     })
    );

    map.on("load", () => { // Controls the search bar for the map
        geocoder.on('result', (event) => {
            console.log(event.result);
            eventResult = event.result;
            searchLocation = event.result.place_name;
            userLocation.val(searchLocation);
        })
    });

    map.on("render", () => {
        map.resize();
    });
};

// Saves searched city in local storage to be read and viewed on results page
function getForecast() {
    localStorage.setItem('userLon', eventResult.center[0]);
    localStorage.setItem('userLat', eventResult.center[1]);
    localStorage.setItem('userLocation', searchLocation);
    window.location.href = './forecast.html';
}

function getWeather(lon, lat){  
    fetch(weatherURL + 'lat=' + lat + '&lon=' + lon + "&units=imperial&" + APIkey)  // takes longitude and latitude data from the city search to call the weather API
      .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var weatherIcon;
      var imageIcon;
      var highDeg = $('.current-deg');
        
      switch(data.daily[0].weather[0].icon){
            case '01d':
            case '01n':
              weatherIcon = 'fa-sun'; 
              imageIcon = './assets/image/mountains-gcfcefc2c7_1280.png' ; break;
            case '02d':
            case '02n':
              weatherIcon = 'fa-cloud-sun';
              imageIcon = "./assets/image/mountains-gf72f61f9f_640.png"; break;
            case '03d':
            case '03n':
            case '04d':
            case '04n':
              weatherIcon = 'fa-cloud'; 
              imageIcon ='./assets/image/pexels-josh-sorenson-1478524.jpg'; break;
            case '09d':
            case '09n':
              weatherIcon = 'fa-cloud-rain';
              imageIcon ='./assets/image/landscape-gb1b904a1a_1920.jpg'; break;
            case '10d':
            case '10n':
              weatherIcon = 'fa-cloud-showers-heavy'; 
              imageIcon = './assets/image/landscape-gb1b904a1a_1920.jpg'; break;
            case '11d':
            case '11n':
              weatherIcon = 'fa-cloud-bolt'; 
              imageIcon = './assets/image/landscape-gb1b904a1a_1920.jpg'; break;
            case '13d':
            case '13n':
              weatherIcon = 'fa-snowflake';
              imageIcon = './assets/image/landscape-gb1b904a1a_1920.jpg'; break;
            case '50d':
            case '50n':
              weatherIcon = 'fa-smog';
              imageIcon = './assets/image/pinal-jain-x-XwnC7FgFM-unsplash.jpg'; break;
          }
          
        console.log(weatherIcon);
        //localWeather.css('background-image', imageIcon);
        localWeather.children[2].setAttribute('class', 'text-black fas ' + weatherIcon);
        highDeg.textContent = data.daily.temp.max;
        localWeather.children[3].children[0].textContent = data.daily[0].temp.max;
        localWeather.children[3].children[2].textContent = data.daily[0].temp.min;
        localWeather.children[3].children[4].textContent = data.daily[0].weather[0].description;
        localWeather.children[1].textContent = dayjs.unix(data.daily[0].sunrise).format('M/D/YY');
       
    });
};

// The following functions are for automatically grabbing the user's location
function success(pos) {
    const crd = pos.coords;
  
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    lat = crd.latitude;
    console.log(`Longitude: ${crd.longitude}`);
    lon = crd.longitude;
    getWeather(lon, lat);
  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

$( document ).ready(() => {
    console.log("Webpage ready");
  
    userLocation.on("focus", displayModal);
    suggestionsBtn.on("click", getForecast);
  
    generateMap();
})
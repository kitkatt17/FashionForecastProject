var weatherURL = 'https://api.openweathermap.org/data/3.0/onecall?'
var APIkey = 'appid=5a2b8d33311dc86fb5608e194db81f27';
var lon;
var lat;
var searchLocation;
var eventResult;

// Grab necessary elements
var userLocation = $('#search-location');
var mapModal = $('#mapModal');
var clothingContainer = $('.clothing-container');
var clothingModal = new bootstrap.Modal('#clothingModal');
var clothingModalEl = document.getElementById('clothingModal');
var placeEL = $('#place');
var weatherCards = $('.weather-card');
var weatherContainer = $('#weather-container');


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
            userLocation.val(event.result.place_name);
            localStorage.setItem('lastFFSearch', JSON.stringify(eventResult));
        })
    });

    map.on("render", () => {
        map.resize();
    });
};

// Grabs the searched location and spits out longitude/latitude
function parseLocation(result) {
    lon = result.center[0];
    lat = result.center[1];
    placeEL.text("Weather for " + result.place_name);
    weatherContainer.attr('class', 'row');
    getWeather(lon, lat);
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
        //gets data for each weather card (day) and displays it
         for(var i=0; i<weatherCards.length; i++){
          
        switch(data.daily[i].weather[0].icon){
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
            
           weatherCards[i].children[0].children[0].setAttribute('src', imageIcon);
          weatherCards[i].children[0].children[2].setAttribute('class', 'absolute top-1 right-1 text-8xl sm:text-8xl md:text-7xl lg:text-6xl xl:text-5xl 2xl:text-3xl text-black fas ' + weatherIcon);
         highDeg[i].textContent = data.daily[i].temp.max;
          weatherCards[i].children[0].children[4].children[0].textContent = data.daily[i].temp.max;
          weatherCards[i].children[0].children[4].children[2].textContent = data.daily[i].temp.min;
          weatherCards[i].children[0].children[4].children[4].textContent = data.daily[i].weather[0].description;
          weatherCards[i].children[0].children[4].children[4].setAttribute('data-weatherID', data.daily[i].weather[0].id);
          weatherCards[i].children[0].children[1].textContent = dayjs.unix(data.daily[i].sunrise).format('M/D/YY');
         }
      });
};

var cityFormEl = document.querySelector('#city-search');
var cityInputEl = document.querySelector('#search-location');

var formSubmitHandler = function (event) {
  event.preventDefault();

  if(eventResult){
    parseLocation(eventResult);
  }

};

// Initially loads weather from searched city on homepage
function loadWeather() {
  searchLocation = localStorage.getItem('userLocation');
  lon = localStorage.getItem('userLon');
  lat = localStorage.getItem('userLat');

  placeEL.text("Weather for " + searchLocation);
  getWeather(lon, lat);
}

// Grabs weather ID from weather description to suggest clothing
function getWeatherID(target) {
  if (target.tagName == 'SPAN') {
    target = target.parentElement.parentElement;
  }
  else {
    target = target.parentElement;
  }
  return target.children[4].children[4].getAttribute('data-weatherID');
}

// Suggests appropriate clothing based on weather ID
function suggestClothing(weatherID) {
var suggestion = [];
if (weatherID >= 200 && weatherID < 300) {
  console.log("thunderstorm");
  suggestion.push('jacket', 'sweater');
}
else if (weatherID >= 300 && weatherID < 400) {
  console.log("drizzle");
  suggestion.push('jacket');
}
else if (weatherID >= 500 && weatherID < 600) {
  console.log("rain");
  suggestion.push('jacket', 'sweater');
}
else if (weatherID >= 600 && weatherID < 700) {
  console.log("snow");
  suggestion.push('puffyjacket', 'gloves', 'boots')
}
else if (weatherID >= 800) {
  console.log("clear sky");
  suggestion.push('t-shirt', 'shorts');
}
else {
  console.log("Invalid ID");
}
searchClothing(suggestion);
}

// API call that searches for clothing
function searchClothing(suggestion) {
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '465ec9dd4dmshe4c6638850c7838p148205jsn273e0cdeaa09',
        'X-RapidAPI-Host': 'amazon-price1.p.rapidapi.com'
    }
};

for (var i = 0; i < suggestion.length; i++) {
  fetch('https://amazon-price1.p.rapidapi.com/search?keywords=' + suggestion[i] + '&marketplace=US', options)
      .then(response => response.json())
      .then(response => {console.log(response); generateCards(response)})
      .catch(err => console.error(err));
}
}

// Generates the cards that are displayed in a modal for each clothing result
function generateCards(result) {
for (var i = 0; i < result.length; i++) {
    var itemName = result[i].title;
    var itemPrice = result[i].price;
    var itemImg = result[i].imageUrl;
    var itemURL = result[i].detailPageURL;


    var clothingCard = $('<div>')
        .addClass('card')
        .css('width', '18rem');
    
    var clothingURL = $('<a>')
        .attr('href', itemURL)
        .attr('target', '_blank');
    var clothingImg = $('<img>')
        .addClass('card-img-top')
        .attr('src', itemImg)
        .attr('alt', 'Clothing Image');
    clothingURL.append(clothingImg);

    var clothingCardBody = $('<div>')
        .addClass('card-body');
    var clothingName = $('<h5>')
        .addClass('card-title')
        .text(itemName);
    var clothingPrice = $('<p>')
        .addClass('card-text')
        .text(itemPrice);
    clothingCardBody.append(clothingName);
    clothingCardBody.append(clothingPrice);

    clothingCard.append(clothingURL);
    clothingCard.append(clothingCardBody);

    clothingContainer.append(clothingCard);

    clothingModal.show();
}
}

$( document ).ready(() => {
  console.log("Webpage ready");

  userLocation.on("focus", displayModal);
  cityFormEl.addEventListener('submit', formSubmitHandler);

  weatherCards.on("click", (event) => {
    var target = event.target;
    var weatherID = getWeatherID(target);
    console.log(weatherID);
    suggestClothing(weatherID);
  })

  clothingModalEl.addEventListener('hidden.bs.modal', () => {
    clothingContainer.html('');
  })

  loadWeather();
  generateMap();
});
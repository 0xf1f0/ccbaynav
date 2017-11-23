/**
 * Initialize and display Google maps
 */

var initial_lat = 27.75875;            //  The corresponding latitude of map center at initialization.
var initial_lng = -97.245233;          //  The corresponding longitude of map center at initialization.
var initial_zoom = 11;                 //  The corresponding zoom of map center at initialization.
var map;


//This function initializes the Google Maps

function initMap() {
    var latlng = {lat: initial_lat, lng: initial_lng};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: initial_zoom,
        center: latlng,
        mapTypeId: 'roadmap'
    });

    //Data Stations
    var markers = [['Aransas Pass', 27.8366, -97.0391],
        ['Port_Aransas', 27.8397, -97.0725],
        ['USS Lexington', 27.8149, -97.3892],
        ['Bob Hall Pier', 27.5800, -97.2167]
    ];

    // Info Window Content
    var infoWindowContent = [
        ['<div class="info_content">' + '<h3>Station: Aransas Pass</h3>' + '</div>'],
        ['<div class="info_content">' + '<h3>Station: Port Aransas</h3>' + '</div>'],
        ['<div class="info_content">' + '<h3>Station: USS Lexington</h3>' + '</div>'],
        ['<div class="info_content">' + '<h3>Station: Bob Hall Pier</h3>' + '</div>'],];

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    /* Loop through the array of markers(data stations)
       Place the markers on the map
     */
    for (i = 0; i < markers.length; i++) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: 'static/media/mapicons/lighthouse.png',
            title: markers[i][0]
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            }
        })(marker, i));
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
        this.setZoom(initial_zoom);
        google.maps.event.removeListener(boundsListener);
    });
}

/*
    Anonymous functions that displays the local time (CST)
*/

(function () {
    var timeElement = document.getElementById("date_time");
    var date = null;
    var timezone = 'America/Chicago';
    var format = 'dddd, MMMM Do YYYY, h:mm:ss A';

    function updateClock(date_time) {
        date = moment(new Date());
        date_time.innerHTML = date.tz(timezone).format(format);
    }

    setInterval(function () {
        updateClock(timeElement);
    }, 1000);
}());


// Fetch current weather JSON data from static folder/api/filename

var current_weather_json = "/static/api/current_weather.json"
var five_days_forecast_json = "/static/api/five_days_forecast.json"
var fahrenheit = " °F";
var percent = '%';

$.ajax({
    url: current_weather_json,
    dataType: 'json',
    type: 'get',
    cache: true,
    success: function (data) {

        // console.log(data);
        document.getElementById("city").innerHTML = data["name"];
        document.getElementById("humidity").innerHTML = "Humidity: " + data["main"].humidity + percent;
        // document.getElementById("pressure").innerHTML = data["main"].pressure;
        document.getElementById("temp").innerHTML = "Temp: " + Math.round(data["main"].temp) + fahrenheit;
        document.getElementById("temp_max").innerHTML = "Min Temp: " + Math.round(data["main"].temp_max) + fahrenheit;
        document.getElementById("temp_min").innerHTML = "Max Temp: " + Math.round(data["main"].temp_min) + fahrenheit;
        // document.getElementById("main").innerHTML = data.weather[0].main;
        document.getElementById("description").innerHTML = data.weather[0].description;
        var iconDesc = data.weather[0].description;
        var iconName = data.weather[0].icon;
        var altUrl = "http://openweathermap.org/img/w/";
        var baseUrl = "/static/media/weathericons/";
        var baseIcon = baseUrl + getWeatherIcon(iconName);
        var altIcon = altUrl + getWeatherIcon(iconName);
        $("#icon").attr({
            src: baseIcon,
            alt: iconDesc,
            onerror: "this.onerror=null;this.src='" + altIcon + "';"
        });
    }
});


// Fetch five days/ 3hrs weather forecast JSON data from static folder/api/filename
$.ajax({
    url: five_days_forecast_json,
    dataType: 'json',
    type: 'get',
    cache: true,
    success: function (data) {
        var chunk = 8;
        var json_obj = data["list"];
        // console.log(json_obj);

        document.getElementById("grid").innerHTML = output;
        // for (var index in data["list"]) {
        //     console.log(
        //     data["list"][index].main.temp,
        //         data["list"][index].weather[0].description,
        //         data["list"][index].weather[0].icon,
        //         epochToDate(data["list"][index].dt),
        //         data["list"].length
        //     );
    }
});

// Converts an epoch(unix time) to readable Day, Time AM/PM
function epochToDay(epoch_time) {
    // var format = 'dddd, MMMM Do YYYY, h:mm:ss A';
    var format = "ddd, h:mm A";
    var day = moment.unix(epoch_time).format(format);
    return day;
}

//Get the icon url for a corresponding icon

function getWeatherIcon(iconName) {
    var iconFile = null;
    var ext = ".png";
    switch (iconName) {
        case "01d":
            iconFile = "01d";
            break;
        case "01n":
            iconFile = "01n";
            break;
        case "02d":
            iconFile = "02d";
            break;
        case "02n":
            iconFile = "02n";
            break;
        case "03d":
            iconFile = "03d";
            break;
        case "03n":
            iconFile = "03n";
            break;
        case "04d":
            iconFile = "04d";
            break;
        case "04n":
            iconFile = "04n";
            break;
        case "09d":
            iconFile = "09d";
            break;
        case "09n":
            iconFile = "09n";
            break;
        case "10d":
            iconFile = "10d";
            break;
        case "10n":
            iconFile = "10n";
            break;
        case "11d":
            iconFile = "11d";
            break;
        case "11n":
            iconFile = "11n";
            break;
        case "13d":
            iconFile = "13d";
            break;
        case "13n":
            iconFile = "13n";
            break;
        case "50d":
            iconFile = "50d";
            break;
        case "50n":
            iconFile = "50n";
            break;
    }
    return (iconFile + ext);
}
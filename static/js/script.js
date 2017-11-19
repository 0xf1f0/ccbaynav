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


// Fetch open weather JSON data from static folder/api/filename

var current_weather_json = "/static/api/current_weather.json"

$.ajax({
    url: current_weather_json,
    dataType: 'json',
    type: 'get',
    cache: false,
    success: function (data) {
        console.log(data);
        document.getElementById("city").innerHTML = data["name"];
        document.getElementById("humidity").innerHTML = data["main"].humidity;
        document.getElementById("pressure").innerHTML = data["main"].pressure;
        document.getElementById("temp").innerHTML = data["main"].temp;
        document.getElementById("temp_max").innerHTML = data["main"].temp_max;
        document.getElementById("temp_min").innerHTML = data["main"].temp_min;
        // document.getElementById("main").innerHTML = data.weather[0].main;
        document.getElementById("description").innerHTML = data.weather[0].description;
        var iconDesc = data.weather[0].description;
        var iconName = data.weather[0].icon;
        var altUrl = "http://openweathermap.org/img/w/";
        var baseUrl = "/static/media/weathericons/";
        var baseIcon = baseUrl + getIcon(iconName);
        var altIcon = altUrl + getIcon(iconName);
        $("#icon").attr({
            src: baseIcon,
            alt: iconDesc,
            onerror: "this.onerror=null;this.src='" + altIcon + "';"
        });
    }
});


//Get the icon url for a corresponding icon

function getIcon(iconName) {
    var iconfile = null;
    var ext = ".png";
    switch (iconName) {
        case "01d":
            iconfile = "01d";
            break;
        case "01n":
            iconfile = "01n";
            break;
        case "02d":
            iconfile = "02d";
            break;
        case "02n":
            iconfile = "02n";
            break;
        case "03d":
            iconfile = "03d";
            break;
        case "03n":
            iconfile = "03n";
            break;
        case "04d":
            iconfile = "04d";
            break;
        case "04n":
            iconfile = "04n";
            break;
        case "09d":
            iconfile = "09d";
            break;
        case "09n":
            iconfile = "09n";
            break;
        case "10d":
            iconfile = "10d";
            break;
        case "10n":
            iconfile = "10n";
            break;
        case "11d":
            iconfile = "11d";
            break;
        case "11n":
            iconfile = "11n";
            break;
        case "13d":
            iconfile = "13d";
            break;
        case "13n":
            iconfile = "13n";
            break;
        case "50d":
            iconfile = "50d";
            break;
        case "50n":
            iconfile = "50n";
            break;
    }
    return (iconfile + ext);
}
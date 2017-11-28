/**
 * Initialize and display Google maps
 */

var initial_lat = 27.75875;            //  The corresponding latitude of map center at initialization.
var initial_lng = -97.245233;          //  The corresponding longitude of map center at initialization.
var initial_zoom = 11;                 //  The corresponding zoom of map center at initialization.
var map;

// Fetch current weather JSON data from static folder/api/filename
var current_weather_json = "/static/api/current_weather.json";
var five_days_forecast_json = "/static/api/five_days_forecast.json";
var marine_traffic_json = "/static/api/marine_traffic.json";
var fahrenheit = " °F";
var percent = '%';


//This function initializes the Google Maps

function initMap() {
    var latlng = {lat: initial_lat, lng: initial_lng};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: initial_zoom,
        center: latlng,
        mapTypeId: 'roadmap'
    });

    //Data Stations markers
    var station_markers = [['Aransas Pass', 27.8366, -97.0391],
        ['Port Aransas', 27.8397, -97.0725],
        ['USS Lexington', 27.8149, -97.3892],
        ['Bob Hall Pier', 27.5800, -97.2167]
    ];


    // Display station markers on a map
    var stationInfoWindow = new google.maps.InfoWindow();
    var marker;
    var infoWindowContent = [station_markers.length];
    /* Loop through the array of markers(data stations)
       Place the markers on the map
     */
    for (var i = 0; i < station_markers.length; i++) {

        // Info Window Content
        infoWindowContent[i] = '<div class="info_content">' + '<h6>' + "Station: " + station_markers[i][0] + '</h6>' + '</div>';
        var position = new google.maps.LatLng(station_markers[i][1], station_markers[i][2]);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: 'static/media/mapicons/lighthouse.png',
            title: station_markers[i][0]
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                stationInfoWindow.setContent(infoWindowContent[i]);
                stationInfoWindow.open(map, marker);
            }
        })(marker, i));
    }

    // Override the map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
        this.setZoom(initial_zoom);
        google.maps.event.removeListener(boundsListener);
    });


    /*
        Display Marine Vessel Traffic on Google Maps
     */
    $.ajax({
        url: marine_traffic_json,
        dataType: 'json',
        type: 'get',
        cache: true,
        success: function (data) {

            //Variables for storing marine traffic data
            var shipName;
            var shipTypeName;
            var shipMmsi;
            var shipLat;
            var shipLon;
            var shipSpeed;
            var shipCallsign;
            var shipFlag;
            var shipDestination;
            var shipEta;

            //Variables for display ship information
            var shipMarker;
            var shipPosition;
            var shipInfo = [data.length];
            var shipInfoWindow;

            // console.log(data);
            for (var i = 0; i < data.length; i++) {
                shipName = data[i].SHIPNAME;
                shipTypeName = data[i].TYPE_NAME;
                shipMmsi = data[i].MMSI;
                shipLat = data[i].LAT;
                shipLon = data[i].LON;
                shipSpeed = data[i].SPEED + " Knot(s)";
                shipCallsign = data[i].CALLSIGN;
                shipFlag = data[i].FLAG;
                shipDestination = data[i].DESTINATION;
                shipEta = data[i].ETA;

                // console.log(shipName, typeName, lat, lon, callSign, flag, destination, eta);

                shipPosition = new google.maps.LatLng(shipLat, shipLon);
                shipInfo[i] = '<div class="ship_info">' +
                    '<h6>' + shipName + '</h6>' +
                    '<h6>' + "Flag: " + shipFlag + '</h6>' +
                    '<h6>' + "Call Sign: " + shipCallsign + '</h6>' +
                    '<h6>' + "Speed: " + shipSpeed + '</h6>' +
                    '<h6>' + "Destination: " + shipDestination + '</h6>' +
                    '<h6>' + "ETA: " + shipEta + '</h6>' +
                    '</div>';

                // console.log(shipInfo[i]);

                shipInfoWindow = new google.maps.InfoWindow();
                shipMarker = new google.maps.Marker({
                    position: shipPosition,
                    map: map,
                    icon: 'static/media/mapicons/vessel.png'
                });

                google.maps.event.addListener(shipMarker, 'click', (function (shipMarker, i) {
                    return function () {
                        shipInfoWindow.setContent(shipInfo[i]);
                        shipInfoWindow.open(map, shipMarker);
                    }

                })(shipMarker, i));
                google.maps.event.addListener(shipMarker, 'mouseover', (function (shipMarker, i) {
                    return function () {
                        shipInfoWindow.setContent(shipInfo[i]);
                        shipInfoWindow.open(map, shipMarker);
                    }
                })(shipMarker, i));

                google.maps.event.addListener(shipMarker, 'mouseout', (function () {
                    return function () {
                        shipInfoWindow.close()
                    }
                })());
            }
        }
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


$.ajax({
    url: current_weather_json,
    dataType: 'json',
    type: 'get',
    cache: true,
    success: function (data) {

        // console.log(data);
        document.getElementById("city").innerHTML = data["name"];
        document.getElementById("humidity").innerHTML = "Humidity: " + data["main"].humidity + percent;
        document.getElementById("temp").innerHTML = "Temp: " + Math.round(data["main"].temp) + fahrenheit;
        document.getElementById("temp_min").innerHTML = "Low: " + Math.round(data["main"].temp_min) + fahrenheit;
        document.getElementById("temp_max").innerHTML = "High: " + Math.round(data["main"].temp_max) + fahrenheit;
        document.getElementById("description").innerHTML = data.weather[0].description;

        //Dynamically add an image and set its attribute
        var icon = document.createElement('img');
        var iconDesc = data.weather[0].description;
        var iconName = data.weather[0].icon;
        var altUrl = "http://openweathermap.org/img/w/";
        var baseUrl = "/static/media/weathericons/";
        var baseIcon = baseUrl + getWeatherIcon(iconName);
        var altIcon = altUrl + getWeatherIcon(iconName);

        icon.id = "icon";
        icon.src = baseIcon;
        icon.alt = iconDesc;
        icon.onerror = "this.onerror=null;this.src='" + altIcon + "';";
        document.getElementById("current-weather").appendChild(icon);
        icon.style.width = "50px";
        icon.style.height = "50px";
    }
});


// Fetch five days/ 3hrs weather forecast JSON data from static folder/api/filename
$.ajax({
    url: "https://api.weather.gov/points/27.77,-97.24/forecast",
    dataType: 'json',
    type: 'get',
    cache: true,
    success: function (data) {
        var json_obj = data["properties"];
        var period = json_obj.periods;
        var len = period.length;
        var icon;
        var wind_speed;
        var wind_dir;
        var temp;
        var header;
        var desc;
        var iconUrl;

        // console.log(period);
        // Get the first ten (Five days) forecast
        for (var i = 0; i < len - 4; i++) {
            // console.log(period[i].name)
            if (period[i].name.toLowerCase().includes("night")) {
                temp = period[i].temperature;
                // console.log("Low: " + temp)
            }
            else {
                temp = period[i].temperature;
                // console.log("High: " + temp)
            }
            header = period[i].name;
            desc = period[i].shortForecast;
            wind_speed = period[i].windSpeed;
            wind_dir = period[i].windDirection;
            iconUrl = period[i].icon;
            var forecast = document.getElementById("five-days-forecast");
            forecast.getElementsByClassName("forecast-item-info")[i].innerHTML = header + "<br>" + temp + fahrenheit +
                "<br>" + desc;

            //Dynamically add an image and set its attribute
            icon = document.createElement('img');
            icon.className = "forecast-icon";
            icon.src = iconUrl;
            icon.alt = "forecast-icon";
            document.getElementsByClassName("forecast-item-icon")[i].appendChild(icon);
            icon.style.width = "86px";
            icon.style.height = "86px";
        }
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



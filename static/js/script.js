/**
 * Initialize and display Google maps
 */

//TODO: Remove Houston Central station markers
//Data Stations markers as a 2-Dimensional Array
var station_markers = [
    ['Aransas Pass', 27.9033, -97.1478],
    ['Port Aransas', 27.836, -97.0682],
    ['USS Lexington', 27.82, -97.4],
    ['Bob Hall Pier', 27.5816, -97.2202],
    ['Houston Central', 29.64, -95.28],
    ['Test point', 39.0693, -94.6716]
];


var initial_lat = 27.75875;             //  The corresponding latitude of map center at initialization.
var initial_lng = -97.245233;           //  The corresponding longitude of map center at initialization.
var zoom = 11;                          //  The corresponding zoom of map center at initialization.
var map;

// Fetch current weather JSON data from static folder/api/filename
var forecast_base_url = "https://api.weather.gov/points/";
var marine_traffic_json = "/static/api/marine_traffic.json";
var fahrenheit = "°F";


//This function initializes the Google Maps

function initMap() {
    var default_weather = ['Corpus Christi Bay', 27.7543, -97.1729];
    var latlng = {lat: initial_lat, lng: initial_lng};
    var default_forecast_url = forecast_base_url + default_weather[1] + ',' + default_weather[2] + "/forecast";
    var default_weather_url = forecast_base_url + default_weather[1] + ',' + default_weather[2] + "/forecast/hourly";

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        center: latlng,
        mapTypeId: 'roadmap'
    });

    displayTime();
    displayStations();
    displayMarineTraffic();
    getWeatherCurrent(default_weather_url, default_weather[0]);
    getWeatherForecast(default_forecast_url);
}

function displayStations() {

    // Display station markers on a map
    var stationInfoWindow = new google.maps.InfoWindow();
    var marker;
    var infoWindowContent = [station_markers.length];
    var station_weather_forecast;
    var station_weather_current;
    var position;


    /* Loop through the array of markers(data stations)
       Place the markers on the map
     */
    for (var i = 0; i < station_markers.length; i++) {

        //Get weather forecast for a base station
        station_weather_forecast = forecast_base_url + station_markers[i][1] +
            "," + station_markers[i][2] + "/forecast";
        station_weather_current = forecast_base_url + station_markers[i][1] +
            "," + station_markers[i][2] + "/forecast/hourly";

        // Info Window Content
        infoWindowContent[i] = '<div class="info_content">' + '<h6>' + "Station: " + station_markers[i][0] +
            '</h6>' + '</div>';
        position = new google.maps.LatLng(station_markers[i][1], station_markers[i][2]);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: 'static/media/mapicons/lighthouse.png',
            title: station_markers[i][0]
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i, station_weather_forecast, station_weather_current, station_markers) {
            return function () {
                stationInfoWindow.setContent(infoWindowContent[i]);
                stationInfoWindow.open(map, marker);
                // console.log(station_weather_forecast, station_weather_current);

                if ($('#current-condition-temp').empty() && $('#current-condition-info').empty() &&
                    $('#current-condition-icon').empty() && $('#current-condition-station').empty()) {
                    getWeatherCurrent(station_weather_current, station_markers[i][0]);
                }

                if ($('.forecast-item-info').empty() && $('.forecast-item-icon').empty()) {
                    getWeatherForecast(station_weather_forecast);
                }

            }
        })(marker, i, station_weather_forecast, station_weather_current, station_markers));
    }
}

function displayMarineTraffic() {
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
function displayTime() {
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
}

function getWeatherCurrent(url, station) {
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'get',
        cache: true,
        success: function (data) {
            var json_obj = data["properties"];
            var period = json_obj.periods;
            var iconUrl = period[0].icon;
            var wind_speed = period[0].windSpeed;
            var wind_dir = period[0].windDirection;
            var temp = period[0].temperature;
            var desc = period[0].shortForecast;
            var last_update = json_obj.updated;
            var icon;
            console.log("Station: " + station);
            //Dynamically add an icon and set its attribute
            icon = document.createElement('img');
            icon.src = iconUrl;
            icon.alt = desc;
            icon.style.width = "100%";
            icon.style.height = "100%";


            // Display the icon and content
            document.getElementById("current-condition-temp").innerHTML = "<p>" + temp + fahrenheit + "</p>";
            document.getElementById("current-condition-info").innerHTML = "<p>" + station + "<br>" + desc + "<br>" +
                wind_dir + " " + wind_speed;
            document.getElementById("current-condition-icon").appendChild(icon);
        }
    });

}

// Fetch five days/ Night + Day weather forecast JSON data from static folder/api/filename
function getWeatherForecast(url) {

    $.ajax({
        url: url,
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
            var time;
            var desc;
            var iconUrl;
            var content;

            // console.log("Calling: " + url, len);
            // Get the first ten (Five days) forecast
            for (var i = 0; i < len - 4; i++) {
                // console.log(period[i].name);
                if (period[i].name.toLowerCase().includes("night")) {
                    temp = period[i].temperature;
                    // console.log("Low: " + temp)
                }
                else {
                    temp = period[i].temperature;
                    // console.log("High: " + temp)
                }
                time = period[i].name;
                desc = period[i].shortForecast;
                wind_speed = period[i].windSpeed;
                wind_dir = period[i].windDirection;
                iconUrl = period[i].icon;
                var forecast = document.getElementById("five-days-forecast");
                content = "<p>" + time + "</p>" + "<p>" + temp + fahrenheit + "<br>" + desc + "</p>";

                //Dynamically add an icon and set its attribute
                icon = document.createElement('img');
                icon.src = iconUrl;
                icon.alt = "forecast-icon";
                icon.style.width = "100%";
                icon.style.height = "100%";

                // Display the icon and content
                forecast.getElementsByClassName("forecast-item-info")[i].innerHTML = content;
                document.getElementsByClassName("forecast-item-icon")[i].appendChild(icon);
            }
        }
    });
}

// Converts an epoch(unix time) to readable Day, Time AM/PM
function epochToDay(epoch_time) {
    // var format = 'dddd, MMMM Do YYYY, h:mm:ss A';
    var format = "ddd, h:mm A";
    return moment.unix(epoch_time).format(format);
}

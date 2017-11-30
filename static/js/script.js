/**
 * Initialize and display Google maps
 */

var initial_lat = 27.75875;            //  The corresponding latitude of map center at initialization.
var initial_lng = -97.245233;          //  The corresponding longitude of map center at initialization.
var initial_zoom = 11;                 //  The corresponding zoom of map center at initialization.
var map;

// Fetch current weather JSON data from static folder/api/filename
var forecast_base_url = "https://api.weather.gov/points/";
var marine_traffic_json = "/static/api/marine_traffic.json";
var fahrenheit = "°F";


//This function initializes the Google Maps

function initMap() {
    var latlng = {lat: initial_lat, lng: initial_lng};
    var default_forecast_url = forecast_base_url + initial_lat + ',' + initial_lng + "/forecast";
    var default_weather_url = forecast_base_url + initial_lat + ',' + initial_lng + "/forecast/hourly";

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: initial_zoom,
        center: latlng,
        mapTypeId: 'roadmap'
    });

    displayTime();
    displayStations();
    displayMarineTraffic();
    getWeatherCurrent(default_weather_url);
    getWeatherForecast(default_forecast_url);
}

function displayStations() {

    //TODO: Remove Houston Central station markers
    //Data Stations markers as a 2-Dimensional Array
    var station_markers = [['Aransas Pass', 27.8366, -97.0391],
        ['Port Aransas', 27.8397, -97.0725],
        ['USS Lexington', 27.8149, -97.3892],
        ['Bob Hall Pier', 27.5800, -97.2167],
        ['Houston Central', 29.64, -95.28]
    ];


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

        google.maps.event.addListener(marker, 'click', (function (marker, i, station_weather_forecast, station_weather_current) {
            return function () {
                stationInfoWindow.setContent(infoWindowContent[i]);
                stationInfoWindow.open(map, marker);
                // console.log(station_weather_forecast);
                if ($('.forecast-item-info').empty() && $('.forecast-item-icon').empty()) {
                    getWeatherForecast(station_weather_forecast);
                }

                if ($('#current-condition-temp').empty() && $('#current-condition-info').empty() && $('#current-condition-icon').empty()) {
                    getWeatherCurrent(station_weather_current);
                }
            }
        })(marker, i, station_weather_forecast, station_weather_current));
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
        cache: false,
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

function getWeatherCurrent(url) {
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'get',
        cache: false,
        success: function (data) {
            console.log(url);
            var json_obj = data["properties"];
            var period = json_obj.periods;
            var iconUrl = period[0].icon;
            var wind_speed = period[0].windSpeed;
            var wind_dir = period[0].windDirection;
            var temp = period[0].temperature;
            var desc = period[0].shortForecast;
            var last_update = json_obj.updated;
            var current_condition;
            var icon;

            console.log(iconUrl, wind_speed, wind_dir, temp, desc, last_update);
            console.log(json_obj);

            //Dynamically add an icon and set its attribute
            icon = document.createElement('img');
            icon.src = iconUrl;
            icon.alt = desc;
            icon.style.width = "100%";
            icon.style.height = "100%";


            // Display the icon and content
            document.getElementById("current-condition-temp").innerHTML = "<p>" + temp + fahrenheit + "</p>";
            document.getElementById("current-condition-info").innerHTML = "<p>" + desc + "<br>" +
                wind_dir + " " + wind_speed + "</p>";
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
        cache: false,
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
                // console.log(period[i].name)
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


(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "be7abfc9-1bef-41f9-b362-b4b535e1241c": {
                            "roots": {
                                "references": [{
                                    "attributes": {
                                        "below": [{
                                            "id": "8f89443b-5e6c-4956-9247-6c457394f815",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "d6ce7475-353c-4988-a886-8d92fa9af70f",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "8f89443b-5e6c-4956-9247-6c457394f815",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "9357ddaf-5934-40a1-b94b-4c7c3a223527",
                                            "type": "Grid"
                                        }, {
                                            "id": "d6ce7475-353c-4988-a886-8d92fa9af70f",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "1f5ee0c7-1b91-42d0-baae-8a61ca2b93a8",
                                            "type": "Grid"
                                        }, {
                                            "id": "67e7aec3-d1b8-484b-b4b4-f5fe0dac405d",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "01cf8ac0-4333-4089-9451-74acd2a6282f",
                                            "type": "Legend"
                                        }, {
                                            "id": "0b98a3ca-55d3-4e16-9217-57249cdaaa09",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "236c2402-8005-41c9-9fdc-f006b1546aa1",
                                            "type": "GlyphRenderer"
                                        }, {"id": "538be767-9760-4b32-af88-371956c51fd0", "type": "GlyphRenderer"}],
                                        "title": {"id": "37f5f754-d2e6-40b6-88e2-b57a149b8ce6", "type": "Title"},
                                        "toolbar": {
                                            "id": "7916a4bf-48d5-4a1d-bfcc-9bc44f6d450f",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "9cca8219-0bd3-47b2-8143-92478cb3de67",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "98e127e1-33a0-4d6b-9686-a6e4a018c0cd",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "430b7c93-6eb2-4fd3-a59a-85ec0ef3d38c",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "dc537c87-40de-4cfe-adde-939d2de792b2",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "62a0860f-0062-4839-b21c-4a947d3db90c",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "1becc66f-da20-4c35-9cf3-263e7428abe7",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "d6ce7475-353c-4988-a886-8d92fa9af70f", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "1cd5a0b6-2b28-45bf-b9e4-4b4556bf84bd",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "a4a0f9e0-0f42-4a74-ba3e-d6f25f1df789",
                                            "type": "LegendItem"
                                        }, {"id": "0133cfb9-dfdb-4504-907c-fef06ec3e725", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "01cf8ac0-4333-4089-9451-74acd2a6282f", "type": "Legend"
                                }, {
                                    "attributes": {},
                                    "id": "b6545b49-27b0-40df-8c15-6286fba26190",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "94edd8a8-7380-4b24-86c9-f290dc4b6c5a",
                                            "type": "PanTool"
                                        }, {
                                            "id": "f7e8d0b2-52a8-4d2b-92a9-3bc1343334b6",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "3c286baf-605c-4f1e-8d44-c963866f9ce2",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "5b0c9532-7e51-4fd1-b68b-b40702794aa4",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "b6545b49-27b0-40df-8c15-6286fba26190",
                                            "type": "ResetTool"
                                        }, {"id": "e7bf5246-9c0b-4aa6-a5af-71a0ae4d67af", "type": "HelpTool"}]
                                    }, "id": "7916a4bf-48d5-4a1d-bfcc-9bc44f6d450f", "type": "Toolbar"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "339c7570-7e99-4a47-8cd8-69087a150700", "type": "Line"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "236c2402-8005-41c9-9fdc-f006b1546aa1",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "a4a0f9e0-0f42-4a74-ba3e-d6f25f1df789", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "dc537c87-40de-4cfe-adde-939d2de792b2",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "247d9c27-3c89-40d5-8145-6fe2fecbfa0d",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "48697508-116c-4747-9158-718536db96d5",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "8f89443b-5e6c-4956-9247-6c457394f815", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "48697508-116c-4747-9158-718536db96d5",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "9357ddaf-5934-40a1-b94b-4c7c3a223527", "type": "Grid"
                                }, {
                                    "attributes": {},
                                    "id": "5b0c9532-7e51-4fd1-b68b-b40702794aa4",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["11.66", "12.25", "11.66", "11.27", "10.69", "11.27", "12.25", "12.25", "12.05", "11.86", "11.66", "11.66", "11.47", "11.86", "12.25", "12.25", "12.25", "11.08", "11.47", "11.86", "12.63", "12.83", "12.83", "12.44", "12.63", "12.63", "11.66", "12.63", "11.47", "12.05", "12.44", "12.44", "13.22", "12.05", "11.66", "12.05", "12.05", "12.83", "13.22", "13.61", "13.22", "14.19", "14.00", "14.00", "13.41", "14.19", "13.41", "14.58", "14.77", "14.00", "13.41", "14.97", "16.52", "15.16", "15.36", "15.16", "15.36", "14.00", "14.19", "13.02", "14.38", "15.36", "15.16", "14.77", "14.58", "13.22", "13.80", "14.38", "14.38", "14.77", "13.80", "14.97", "14.97", "13.61", "14.19", "13.41", "13.41", "14.19", "14.00", "14.19", "14.00", "14.00", "13.61", "13.80", "13.41", "13.61", "14.00", "13.80", "14.19", "13.80", "14.58", "15.16", "14.77", "14.58", "14.19", "13.22", "14.77", "14.00", "13.80", "13.61", "13.22", "13.41", "13.02", "12.05", "12.25", "11.66", "12.63", "13.22", "13.80", "13.41", "14.00", "13.80", "13.02", "13.80", "13.41", "13.80", "13.22", "14.97", "15.16", "15.55", "14.38", "15.55", "15.55", "12.83", "14.19", "14.97", "14.58", "12.83", "13.41", "12.63", "13.22", "13.22", "12.63", "13.61", "13.22", "13.02", "12.63", "13.02", "13.22", "13.80", "13.41", "13.22", "13.61", "14.38", "14.38", "13.80", "13.22", "11.66", "12.25", "12.25", "10.69", "11.27", "11.47", "12.05", "11.47", "11.47", "10.30", "11.27", "10.89", "10.11", "9.72", "10.11", "10.50", "10.30", "10.30", "10.11", "9.52", "8.94", "10.11", "10.69", "10.30", "10.30", "9.91", "9.33", "9.14", "9.72", "9.72", "10.11", "10.30", "10.11", "9.72", "9.52", "9.14", "9.14", "9.52", "9.52", "9.33", "9.14", "9.52", "8.94", "7.97", "7.78", "7.78", "7.78", "7.78", "7.78", "7.19", "6.61", "5.64", "5.44", "4.86", "5.05", "6.41", "6.61", "6.22", "5.83", "6.03", "6.22", "6.03", "6.41", "6.61", "7.58", "7.97", "8.75", "9.33", "9.14", "9.52", "9.14", "9.72", "10.30", "9.52", "9.91", "9.14", "9.33", "9.52", "7.97", "7.78", "7.39", "7.58", "6.80", "6.61", "6.03", "5.83", "6.61", "6.22", "6.03", "7.00", "6.61", "6.80"]
                                        }
                                    }, "id": "02c710c3-057a-421f-af89-48c6a5ff86ec", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "67e7aec3-d1b8-484b-b4b4-f5fe0dac405d", "type": "BoxAnnotation"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "7752459d-a61b-4a70-9d79-531a2ff1b3d0", "type": "Line"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "3f0634a8-0c27-481b-95ec-410283b8161a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "1becc66f-da20-4c35-9cf3-263e7428abe7",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "1f5ee0c7-1b91-42d0-baae-8a61ca2b93a8", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "aa4b1026-f7b8-47e2-bbf9-5de9a94f262d", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "bb92bdac-b12b-45af-adf8-e83732a55e13", "type": "Line"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "247d9c27-3c89-40d5-8145-6fe2fecbfa0d",
                                    "type": "DatetimeTickFormatter"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "ad3cbf09-5d6a-4760-9a8c-66b3a106feac",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "88621059-1dd2-4525-8eca-2c6e1b4a38df", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "7752459d-a61b-4a70-9d79-531a2ff1b3d0",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "19c2d763-086e-44c1-b575-6e90b5d57156", "type": "CDSView"}
                                    }, "id": "0b98a3ca-55d3-4e16-9217-57249cdaaa09", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "94edd8a8-7380-4b24-86c9-f290dc4b6c5a",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "0b98a3ca-55d3-4e16-9217-57249cdaaa09",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "1cd5a0b6-2b28-45bf-b9e4-4b4556bf84bd", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "98e127e1-33a0-4d6b-9686-a6e4a018c0cd",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {},
                                    "id": "f7e8d0b2-52a8-4d2b-92a9-3bc1343334b6",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "39492f56-30ef-429b-a17f-5987d43d1f4a",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "46570df0-2fda-4d08-8e4c-72d0d8ba63ea", "type": "CDSView"
                                }, {
                                    "attributes": {},
                                    "id": "e7bf5246-9c0b-4aa6-a5af-71a0ae4d67af",
                                    "type": "HelpTool"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "430b7c93-6eb2-4fd3-a59a-85ec0ef3d38c",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "ad3cbf09-5d6a-4760-9a8c-66b3a106feac",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "19c2d763-086e-44c1-b575-6e90b5d57156", "type": "CDSView"
                                }, {
                                    "attributes": {},
                                    "id": "1becc66f-da20-4c35-9cf3-263e7428abe7",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["6.61", "6.61", "6.80", "7.00", "7.78", "8.16", "9.14", "10.11", "10.50", "10.11", "10.30", "9.52", "9.33", "10.11", "9.33", "8.75", "8.55", "9.52", "9.91", "10.11", "9.91", "10.30", "9.91", "9.91", "10.30", "9.33", "10.30", "9.52", "9.14", "8.94", "8.75", "8.36", "8.36", "7.97", "8.55", "9.52", "10.30", "10.69", "10.30", "11.66", "11.86", "11.86", "12.25", "12.25", "12.05", "12.44", "13.02", "12.05", "12.63", "12.44", "12.83", "12.25", "13.41", "13.02", "13.22", "13.22", "13.80", "13.80", "11.47", "12.05", "13.02", "11.86", "12.44", "12.44", "12.44", "12.44", "12.25", "12.63", "12.05", "11.86", "12.05", "11.47", "11.66", "12.05", "11.27", "11.47", "11.08", "11.66", "11.08", "10.89", "11.08", "11.27", "11.08", "10.50", "10.11", "10.11", "9.91", "10.89", "11.08", "12.44", "11.86", "12.25", "12.63", "12.83", "11.66", "12.44", "11.86", "11.86", "12.83", "13.22", "13.02", "12.83", "13.02", "13.41", "12.83", "12.83", "12.63", "12.44", "12.05", "12.25", "13.41", "13.41", "12.44", "12.05", "13.41", "15.36", "14.38", "13.80", "13.61", "14.19", "14.97", "14.00", "14.97", "14.19", "12.63", "13.41", "13.61", "13.02", "13.02", "12.83", "12.44", "13.02", "13.41", "13.41", "13.80", "14.38", "13.61", "12.83", "11.47", "13.61", "13.41", "13.41", "12.44", "12.83", "12.63", "11.86", "10.50", "11.08", "11.08", "11.08", "10.50", "10.30", "9.72", "9.72", "9.91", "9.52", "9.33", "10.50", "10.11", "9.33", "9.52", "9.33", "9.72", "9.91", "10.50", "9.72", "9.33", "9.52", "9.72", "9.33", "9.72", "9.91", "9.72", "9.72", "8.94", "8.55", "8.55", "8.75", "9.14", "8.94", "9.14", "8.36", "8.55", "8.36", "8.36", "8.16", "7.97", "7.78", "7.00", "6.80", "7.39", "7.78", "7.97", "7.58", "7.58", "7.39", "6.41", "5.83", "5.25", "4.86", "5.44", "6.41", "6.80", "6.61", "5.83", "5.64", "6.03", "5.25", "6.22", "6.03", "6.80", "8.75", "8.16", "8.16", "7.97", "7.78", "7.58", "7.19", "7.78", "7.39", "7.58", "7.58", "6.80", "7.00", "6.80", "7.19", "6.80", "6.80", "6.61", "6.22", "6.22", "6.22", "6.61", "5.64", "6.22", "6.03", "6.03", "5.83"]
                                        }
                                    }, "id": "39492f56-30ef-429b-a17f-5987d43d1f4a", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {},
                                    "id": "62a0860f-0062-4839-b21c-4a947d3db90c",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "88621059-1dd2-4525-8eca-2c6e1b4a38df", "type": "Line"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "67e7aec3-d1b8-484b-b4b4-f5fe0dac405d",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "3c286baf-605c-4f1e-8d44-c963866f9ce2", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {},
                                    "id": "48697508-116c-4747-9158-718536db96d5",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "02c710c3-057a-421f-af89-48c6a5ff86ec",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "6342e5d0-188f-46f2-ac5e-a79279224760", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "02c710c3-057a-421f-af89-48c6a5ff86ec",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "aa4b1026-f7b8-47e2-bbf9-5de9a94f262d", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "94c61ce6-96f8-45f0-8634-b4f1b7c9a3eb",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "6342e5d0-188f-46f2-ac5e-a79279224760", "type": "CDSView"}
                                    }, "id": "236c2402-8005-41c9-9fdc-f006b1546aa1", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "39492f56-30ef-429b-a17f-5987d43d1f4a",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "339c7570-7e99-4a47-8cd8-69087a150700", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "bb92bdac-b12b-45af-adf8-e83732a55e13",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "46570df0-2fda-4d08-8e4c-72d0d8ba63ea", "type": "CDSView"}
                                    }, "id": "538be767-9760-4b32-af88-371956c51fd0", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "9cca8219-0bd3-47b2-8143-92478cb3de67",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "94c61ce6-96f8-45f0-8634-b4f1b7c9a3eb", "type": "Line"
                                }, {
                                    "attributes": {"plot": null, "text": "wind_gust"},
                                    "id": "37f5f754-d2e6-40b6-88e2-b57a149b8ce6",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["8.75", "7.58", "7.97", "6.41", "6.61", "7.97", "6.41", "6.80", "7.39", "6.22", "7.39", "6.41", "6.41", "6.61", "6.41", "6.61", "6.80", "6.61", "6.03", "6.61", "7.19", "6.80", "6.80", "6.41", "6.41", "6.03", "5.44", "5.83", "6.80", "5.83", "6.22", "5.44", "6.03", "6.22", "7.39", "7.39", "7.19", "7.39", "8.36", "8.75", "9.14", "8.75", "8.94", "9.52", "9.52", "9.33", "10.50", "10.30", "10.30", "10.50", "9.52", "9.72", "10.11", "9.33", "10.50", "9.72", "9.72", "9.14", "8.16", "9.72", "9.72", "10.30", "8.94", "8.75", "8.75", "8.94", "8.75", "7.97", "8.16", "7.78", "7.78", "7.19", "7.58", "7.97", "8.94", "8.16", "8.94", "7.97", "7.78", "8.16", "7.97", "7.78", "8.36", "7.39", "7.00", "7.39", "7.00", "7.19", "7.00", "7.19", "8.55", "8.55", "8.75", "8.75", "7.97", "7.97", "8.75", "8.55", "7.97", "8.94", "9.14", "8.94", "8.36", "8.75", "7.39", "8.16", "8.94", "10.11", "7.78", "9.91", "8.75", "8.16", "8.94", "7.00", "9.91", "7.39", "9.91", "9.14", "10.11", "9.52", "8.55", "9.72", "8.36", "9.14", "9.52", "8.94", "9.33", "11.47", "11.66", "11.08", "8.75", "8.36", "8.75", "8.55", "8.94", "8.55", "8.36", "8.36", "7.39", "7.97", "8.94", "6.41", "8.94", "7.58", "8.36", "8.16", "8.36", "8.55", "8.16", "8.36", "7.58", "7.97", "7.00", "8.36", "7.39", "8.16", "8.94", "9.14", "6.61", "10.30", "9.14", "11.08", "10.30", "10.11", "12.05", "9.91", "9.33", "10.11", "11.47", "10.50", "10.11", "10.11", "10.89", "12.05", "10.89", "10.50", "10.30", "9.72", "11.27", "11.66", "10.30", "11.27", "11.86", "12.44", "12.83", "12.05", "11.86", "11.47", "12.05", "11.08", "10.69", "10.89", "9.33", "9.33", "9.91", "9.52", "9.33", "8.75", "9.91", "9.91", "10.30", "10.50", "11.27", "8.75", "9.72", "10.11", "10.11", "9.91", "9.72", "9.14", "9.52", "10.30", "11.66", "12.25", "11.47", "11.08", "12.05", "11.27", "11.47", "11.86", "11.27", "11.27", "11.66", "9.91", "10.11", "9.91", "8.94", "9.72", "8.55", "8.55", "8.94", "8.75", "8.16", "8.16", "7.97", "8.16", "7.97", "8.16", "7.58"]
                                        }
                                    }, "id": "ad3cbf09-5d6a-4760-9a8c-66b3a106feac", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "538be767-9760-4b32-af88-371956c51fd0",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "0133cfb9-dfdb-4504-907c-fef06ec3e725", "type": "LegendItem"
                                }], "root_ids": ["3f0634a8-0c27-481b-95ec-410283b8161a"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "be7abfc9-1bef-41f9-b362-b4b535e1241c",
                        "elementid": "746ce731-5734-4d37-83a3-a46d2669a2cb",
                        "modelid": "3f0634a8-0c27-481b-95ec-410283b8161a"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();

(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "ed96423d-eee5-47f3-93dc-90f894c5b86e": {
                            "roots": {
                                "references": [{
                                    "attributes": {"callback": null},
                                    "id": "e9ed7478-96d0-4b3c-9a50-952d16075b93",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "5e62d7b2-cb48-4fe0-a624-249f9a53218e",
                                    "type": "DatetimeTickFormatter"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "b2c34857-853f-4c70-b818-5b157a02cc6f",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "3f2948e1-8b87-4fb7-8640-c59b6912677f", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["97.00", "105.00", "101.00", "100.00", "114.00", "109.00", "106.00", "100.00", "101.00", "102.00", "101.00", "105.00", "112.00", "107.00", "104.00", "107.00", "106.00", "109.00", "107.00", "106.00", "111.00", "109.00", "110.00", "114.00", "121.00", "127.00", "127.00", "127.00", "126.00", "122.00", "121.00", "119.00", "115.00", "124.00", "119.00", "121.00", "123.00", "125.00", "115.00", "115.00", "114.00", "113.00", "114.00", "112.00", "110.00", "111.00", "112.00", "115.00", "117.00", "113.00", "113.00", "113.00", "118.00", "114.00", "113.00", "118.00", "120.00", "119.00", "118.00", "115.00", "117.00", "120.00", "116.00", "114.00", "113.00", "118.00", "122.00", "117.00", "119.00", "118.00", "118.00", "114.00", "114.00", "117.00", "113.00", "113.00", "114.00", "112.00", "115.00", "117.00", "114.00", "113.00", "118.00", "121.00", "119.00", "120.00", "122.00", "132.00", "137.00", "134.00", "137.00", "137.00", "135.00", "135.00", "138.00", "137.00", "138.00", "137.00", "129.00", "128.00", "129.00", "130.00", "130.00", "136.00", "138.00", "141.00", "135.00", "142.00", "142.00", "142.00", "139.00", "142.00", "138.00", "136.00", "140.00", "135.00", "139.00", "140.00", "142.00", "139.00", "139.00", "140.00", "143.00", "143.00", "145.00", "144.00", "145.00", "139.00", "141.00", "144.00", "145.00", "147.00", "138.00", "144.00", "141.00", "140.00", "138.00", "139.00", "142.00", "145.00", "145.00", "140.00", "142.00", "145.00", "137.00", "140.00", "145.00", "146.00", "142.00", "140.00", "153.00", "151.00", "145.00", "143.00", "148.00", "137.00", "141.00", "144.00", "148.00", "135.00", "131.00", "133.00", "142.00", "132.00", "140.00", "137.00", "127.00", "129.00", "129.00", "124.00", "130.00", "137.00", "129.00", "129.00", "121.00", "135.00", "128.00", "132.00", "147.00", "132.00", "139.00", "141.00", "150.00", "135.00", "143.00", "136.00", "144.00", "151.00", "148.00", "139.00", "143.00", "146.00", "133.00", "146.00", "140.00", "133.00", "147.00", "152.00", "166.00", "126.00", "135.00", "136.00", "137.00", "157.00", "127.00", "131.00", "111.00", "114.00", "112.00", "121.00", "137.00", "105.00", "111.00", "104.00", "107.00", "118.00", "124.00", "120.00", "126.00", "121.00", "110.00", "110.00", "121.00", "105.00", "101.00", "92.00", "97.00", "94.00", "105.00", "104.00", "90.00", "102.00", "104.00", "92.00", "99.00", "91.00", "92.00", "88.00", "97.00"]
                                        }
                                    }, "id": "4146aa89-49d6-49f5-abad-8c1c723e2606", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "4146aa89-49d6-49f5-abad-8c1c723e2606",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "bd3dcb1c-7490-4eee-8175-969dc0fe7cb1", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "10d02f96-810b-45c5-8406-37ba7cf02263",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "53b4ae62-813b-4c0a-893a-9cee51a04df6", "type": "CDSView"}
                                    }, "id": "148d75d5-cc4d-4c73-9b44-255f21c80779", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "below": [{
                                            "id": "4be98bec-3eb0-46e6-96b6-946273aa148c",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "8afaf6bb-d04d-415a-872e-207866af4fa3",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "4be98bec-3eb0-46e6-96b6-946273aa148c",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "3f2948e1-8b87-4fb7-8640-c59b6912677f",
                                            "type": "Grid"
                                        }, {
                                            "id": "8afaf6bb-d04d-415a-872e-207866af4fa3",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "03104eb0-81c3-4838-a5d0-fe17e8ff2fd1",
                                            "type": "Grid"
                                        }, {
                                            "id": "19c1ec33-f8b5-4507-8491-6cbe432a9b4a",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "424e9877-3fc4-465a-bacb-9b1f68f2d475",
                                            "type": "Legend"
                                        }, {
                                            "id": "148d75d5-cc4d-4c73-9b44-255f21c80779",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "66d58595-8731-4649-b8c1-996b1bfa2b30",
                                            "type": "GlyphRenderer"
                                        }, {"id": "66cab1a2-e5a0-4845-be86-14cef4a72824", "type": "GlyphRenderer"}],
                                        "title": {"id": "acf4ebfe-2185-4f2f-b21e-0b6c32f5c1e2", "type": "Title"},
                                        "toolbar": {
                                            "id": "91968d3b-fa61-43ae-bbc0-893d7e0a280c",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "5adaa78a-68b5-47d3-abe0-2da64feede7a",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "f8b1cd9e-a798-48b3-84d0-7713a0918196",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "e9ed7478-96d0-4b3c-9a50-952d16075b93",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "32e5222a-a80b-43d2-9eef-aff3245535d5",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "7083d808-4456-4a05-af5f-5f1ff5ed0a25", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "7a169533-7676-45ca-97a6-7fbcc1fbf136",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "19c1ec33-f8b5-4507-8491-6cbe432a9b4a",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "02409412-2ae4-42d1-a715-b90317987c2d", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "d60dd6e1-c012-4493-a4d4-e9a94787d173",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "a22935a9-7646-479f-9b23-ad567cdd26a4", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "90414928-e5e6-4f38-b542-760a5a389eec",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "03104eb0-81c3-4838-a5d0-fe17e8ff2fd1", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "80fe7eb6-1ebc-48ec-8589-fef273376e95", "type": "Line"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["97.00", "92.00", "95.00", "98.00", "100.00", "99.00", "93.00", "96.00", "98.00", "102.00", "98.00", "98.00", "105.00", "103.00", "104.00", "106.00", "112.00", "107.00", "104.00", "107.00", "112.00", "113.00", "113.00", "112.00", "115.00", "116.00", "113.00", "114.00", "118.00", "115.00", "112.00", "113.00", "114.00", "111.00", "111.00", "110.00", "111.00", "111.00", "111.00", "111.00", "110.00", "108.00", "106.00", "107.00", "105.00", "104.00", "103.00", "106.00", "108.00", "110.00", "111.00", "113.00", "111.00", "116.00", "114.00", "118.00", "118.00", "117.00", "120.00", "120.00", "121.00", "120.00", "119.00", "119.00", "121.00", "122.00", "122.00", "122.00", "121.00", "121.00", "120.00", "118.00", "117.00", "121.00", "116.00", "117.00", "120.00", "120.00", "119.00", "122.00", "121.00", "121.00", "123.00", "123.00", "121.00", "124.00", "124.00", "126.00", "126.00", "128.00", "131.00", "133.00", "131.00", "130.00", "129.00", "128.00", "131.00", "129.00", "133.00", "132.00", "135.00", "131.00", "134.00", "133.00", "134.00", "135.00", "133.00", "135.00", "135.00", "133.00", "137.00", "137.00", "139.00", "142.00", "141.00", "142.00", "137.00", "136.00", "135.00", "140.00", "140.00", "139.00", "140.00", "140.00", "141.00", "140.00", "142.00", "142.00", "142.00", "142.00", "142.00", "141.00", "142.00", "141.00", "145.00", "147.00", "148.00", "147.00", "150.00", "149.00", "148.00", "147.00", "144.00", "143.00", "144.00", "144.00", "149.00", "154.00", "157.00", "158.00", "157.00", "154.00", "150.00", "150.00", "152.00", "153.00", "154.00", "155.00", "155.00", "153.00", "147.00", "140.00", "140.00", "141.00", "143.00", "142.00", "144.00", "146.00", "144.00", "144.00", "144.00", "144.00", "145.00", "147.00", "149.00", "149.00", "149.00", "150.00", "149.00", "150.00", "153.00", "150.00", "145.00", "145.00", "142.00", "141.00", "140.00", "140.00", "140.00", "140.00", "139.00", "140.00", "139.00", "138.00", "139.00", "143.00", "140.00", "142.00", "136.00", "139.00", "139.00", "133.00", "126.00", "120.00", "124.00", "124.00", "122.00", "124.00", "134.00", "134.00", "127.00", "122.00", "122.00", "123.00", "124.00", "123.00", "120.00", "111.00", "115.00", "116.00", "117.00", "114.00", "115.00", "116.00", "114.00", "114.00", "109.00", "105.00", "107.00", "107.00", "107.00", "103.00", "104.00", "100.00", "99.00", "102.00", "101.00", "103.00", "103.00"]
                                        }
                                    }, "id": "4d08e917-071e-45ed-bca8-454ce5d80364", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "80267727-390a-4c9b-91ff-204e1b35ecbd",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "e3e96e5f-cb68-4f33-b64d-7948cf7f02fb",
                                            "type": "LegendItem"
                                        }, {"id": "0f7d02b9-c7ee-4e5d-b690-1791deace720", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "424e9877-3fc4-465a-bacb-9b1f68f2d475", "type": "Legend"
                                }, {
                                    "attributes": {},
                                    "id": "b2c34857-853f-4c70-b818-5b157a02cc6f",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "b03d11b1-41d8-4f44-ad95-f4024a488e54", "type": "Line"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "4d08e917-071e-45ed-bca8-454ce5d80364",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "391e21f2-948c-451c-896a-1aab6ac47145", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "bd3dcb1c-7490-4eee-8175-969dc0fe7cb1", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "422a46c7-e5ae-4c81-96bf-9fc01ea1f877",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "10d02f96-810b-45c5-8406-37ba7cf02263", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "bc9e76e3-026a-4e42-956b-b0c0dfc3a7d7",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {},
                                    "id": "94731493-16ee-4dd7-8c1d-3442e548b8f8",
                                    "type": "HelpTool"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "66d58595-8731-4649-b8c1-996b1bfa2b30",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "e3e96e5f-cb68-4f33-b64d-7948cf7f02fb", "type": "LegendItem"
                                }, {
                                    "attributes": {"plot": null, "text": "wind_direction"},
                                    "id": "acf4ebfe-2185-4f2f-b21e-0b6c32f5c1e2",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "654665e5-2c0a-42e5-8c3c-0ae38fac083f", "type": "Line"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "66cab1a2-e5a0-4845-be86-14cef4a72824",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "0f7d02b9-c7ee-4e5d-b690-1791deace720", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "d60dd6e1-c012-4493-a4d4-e9a94787d173",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "654665e5-2c0a-42e5-8c3c-0ae38fac083f", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "7083d808-4456-4a05-af5f-5f1ff5ed0a25",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "a22935a9-7646-479f-9b23-ad567cdd26a4", "type": "CDSView"}
                                    }, "id": "66cab1a2-e5a0-4845-be86-14cef4a72824", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "5adaa78a-68b5-47d3-abe0-2da64feede7a",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "4d08e917-071e-45ed-bca8-454ce5d80364",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "b03d11b1-41d8-4f44-ad95-f4024a488e54", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "80fe7eb6-1ebc-48ec-8589-fef273376e95",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "391e21f2-948c-451c-896a-1aab6ac47145", "type": "CDSView"}
                                    }, "id": "66d58595-8731-4649-b8c1-996b1bfa2b30", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "32e5222a-a80b-43d2-9eef-aff3245535d5",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["81.00", "83.00", "85.00", "85.00", "86.00", "84.00", "87.00", "87.00", "85.00", "84.00", "85.00", "90.00", "92.00", "90.00", "93.00", "97.00", "94.00", "93.00", "95.00", "98.00", "99.00", "99.00", "103.00", "105.00", "105.00", "110.00", "108.00", "110.00", "109.00", "112.00", "110.00", "108.00", "108.00", "106.00", "107.00", "108.00", "109.00", "112.00", "111.00", "107.00", "106.00", "104.00", "101.00", "101.00", "102.00", "100.00", "100.00", "103.00", "105.00", "104.00", "104.00", "105.00", "104.00", "105.00", "103.00", "105.00", "106.00", "107.00", "108.00", "107.00", "106.00", "105.00", "106.00", "105.00", "105.00", "104.00", "104.00", "106.00", "104.00", "103.00", "104.00", "103.00", "105.00", "105.00", "104.00", "102.00", "102.00", "104.00", "101.00", "102.00", "104.00", "105.00", "103.00", "106.00", "105.00", "108.00", "109.00", "110.00", "113.00", "120.00", "122.00", "122.00", "121.00", "120.00", "122.00", "120.00", "124.00", "124.00", "124.00", "122.00", "121.00", "118.00", "119.00", "119.00", "122.00", "124.00", "125.00", "125.00", "126.00", "125.00", "126.00", "126.00", "127.00", "128.00", "126.00", "125.00", "122.00", "123.00", "123.00", "126.00", "127.00", "123.00", "126.00", "125.00", "127.00", "128.00", "129.00", "129.00", "128.00", "128.00", "129.00", "130.00", "128.00", "125.00", "125.00", "125.00", "125.00", "124.00", "123.00", "124.00", "127.00", "127.00", "127.00", "129.00", "127.00", "127.00", "129.00", "129.00", "130.00", "130.00", "131.00", "128.00", "128.00", "128.00", "130.00", "126.00", "130.00", "129.00", "124.00", "124.00", "122.00", "121.00", "119.00", "120.00", "117.00", "120.00", "117.00", "118.00", "117.00", "116.00", "115.00", "115.00", "115.00", "118.00", "117.00", "117.00", "117.00", "120.00", "123.00", "123.00", "126.00", "126.00", "127.00", "125.00", "126.00", "125.00", "124.00", "124.00", "126.00", "123.00", "120.00", "117.00", "115.00", "111.00", "113.00", "111.00", "110.00", "110.00", "114.00", "116.00", "113.00", "106.00", "104.00", "104.00", "102.00", "98.00", "93.00", "91.00", "88.00", "87.00", "91.00", "91.00", "89.00", "93.00", "90.00", "87.00", "90.00", "89.00", "88.00", "86.00", "93.00", "89.00", "88.00", "87.00", "85.00", "86.00", "88.00", "81.00", "82.00", "78.00", "80.00", "82.00", "77.00", "74.00", "73.00", "74.00", "77.00", "76.00"]
                                        }
                                    }, "id": "d60dd6e1-c012-4493-a4d4-e9a94787d173", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "148d75d5-cc4d-4c73-9b44-255f21c80779",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "80267727-390a-4c9b-91ff-204e1b35ecbd", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "29ec4e53-cf0d-49f0-868d-007365521d53",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {},
                                    "id": "52f972ee-6319-4001-ad13-58f9cee821e0",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "5e62d7b2-cb48-4fe0-a624-249f9a53218e",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "b2c34857-853f-4c70-b818-5b157a02cc6f",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "4be98bec-3eb0-46e6-96b6-946273aa148c", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "4146aa89-49d6-49f5-abad-8c1c723e2606",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "53b4ae62-813b-4c0a-893a-9cee51a04df6", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "19c1ec33-f8b5-4507-8491-6cbe432a9b4a", "type": "BoxAnnotation"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "52f972ee-6319-4001-ad13-58f9cee821e0",
                                            "type": "PanTool"
                                        }, {
                                            "id": "bc9e76e3-026a-4e42-956b-b0c0dfc3a7d7",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "02409412-2ae4-42d1-a715-b90317987c2d",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "422a46c7-e5ae-4c81-96bf-9fc01ea1f877",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "7a169533-7676-45ca-97a6-7fbcc1fbf136",
                                            "type": "ResetTool"
                                        }, {"id": "94731493-16ee-4dd7-8c1d-3442e548b8f8", "type": "HelpTool"}]
                                    }, "id": "91968d3b-fa61-43ae-bbc0-893d7e0a280c", "type": "Toolbar"
                                }, {
                                    "attributes": {},
                                    "id": "f8b1cd9e-a798-48b3-84d0-7713a0918196",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {},
                                    "id": "90414928-e5e6-4f38-b542-760a5a389eec",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "29ec4e53-cf0d-49f0-868d-007365521d53",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "4bc14761-f06b-44b9-ae12-d23da32aed8a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "90414928-e5e6-4f38-b542-760a5a389eec",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "8afaf6bb-d04d-415a-872e-207866af4fa3", "type": "LinearAxis"
                                }], "root_ids": ["4bc14761-f06b-44b9-ae12-d23da32aed8a"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "ed96423d-eee5-47f3-93dc-90f894c5b86e",
                        "elementid": "a2047977-941d-4b82-a303-4f51b733677a",
                        "modelid": "4bc14761-f06b-44b9-ae12-d23da32aed8a"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();

(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "9f670bcf-42cd-48e4-8047-e1e84c68a20a": {
                            "roots": {
                                "references": [{
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "87d1edbd-0e70-4eeb-a128-029aab478aac", "type": "Line"
                                }, {
                                    "attributes": {"plot": null, "text": "wind_speed"},
                                    "id": "da8af53a-d932-4aca-9124-682da5fc8df7",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "a5c534ca-111c-413f-a0d2-10cf908ebed2", "type": "Line"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["10.30", "10.30", "9.72", "8.16", "9.33", "8.94", "10.11", "9.91", "10.69", "10.69", "10.30", "10.50", "9.33", "10.50", "10.89", "11.08", "11.08", "9.33", "9.91", "10.69", "10.50", "10.89", "11.86", "11.27", "11.47", "11.08", "9.91", "11.47", "8.94", "10.89", "10.69", "11.08", "11.86", "10.69", "9.91", "11.08", "10.50", "11.47", "12.05", "12.25", "12.05", "12.83", "12.05", "12.44", "11.86", "13.02", "11.27", "12.44", "13.22", "11.66", "11.27", "13.61", "13.80", "13.41", "13.41", "13.80", "12.83", "12.83", "12.44", "11.08", "12.63", "13.02", "13.22", "12.83", "11.86", "11.66", "12.05", "12.83", "12.63", "13.22", "12.63", "13.41", "13.41", "11.27", "11.86", "11.86", "11.08", "12.83", "13.02", "13.02", "12.44", "12.44", "11.66", "12.44", "11.86", "12.05", "12.44", "12.44", "12.25", "11.47", "13.02", "13.22", "12.25", "12.05", "12.25", "11.86", "12.83", "12.83", "11.27", "11.86", "11.27", "11.27", "10.69", "10.50", "10.69", "10.69", "10.50", "12.05", "12.05", "12.63", "12.63", "11.27", "10.89", "11.86", "12.25", "12.05", "12.05", "13.61", "13.80", "14.00", "12.83", "13.80", "12.44", "11.86", "12.63", "13.61", "12.63", "11.66", "12.05", "11.66", "11.86", "10.69", "11.66", "11.86", "11.27", "11.66", "11.27", "11.66", "11.86", "12.25", "11.47", "11.08", "12.25", "12.63", "13.41", "12.05", "11.47", "10.69", "10.11", "9.72", "8.94", "9.14", "10.50", "11.08", "10.30", "9.52", "9.33", "9.91", "9.72", "8.94", "8.75", "9.33", "9.72", "9.33", "8.94", "8.75", "8.55", "8.16", "9.33", "9.33", "9.52", "9.14", "8.75", "8.16", "8.55", "8.36", "8.36", "8.75", "9.33", "9.14", "8.55", "8.36", "8.55", "8.36", "8.36", "8.55", "8.16", "8.36", "7.97", "7.58", "7.19", "7.00", "7.00", "7.19", "7.19", "6.61", "6.22", "5.25", "5.05", "4.67", "4.28", "4.67", "5.83", "6.03", "5.44", "4.67", "5.44", "5.83", "5.25", "6.22", "6.03", "7.00", "7.78", "8.36", "8.55", "7.97", "8.55", "8.16", "9.14", "9.33", "8.55", "8.75", "7.97", "8.55", "7.78", "7.19", "7.00", "6.61", "6.22", "6.22", "5.64", "5.44", "5.25", "6.03", "5.83", "5.64", "6.41", "6.22", "6.22"]
                                        }
                                    }, "id": "962af6a8-5a8e-4ab1-addf-089ec7f83237", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "29652f75-cef2-406b-975f-aaa134f76b47",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "0ff91ae5-91bf-43aa-9e7d-87a5ab35f410",
                                            "type": "LegendItem"
                                        }, {"id": "e1b02b4b-877e-4ec6-a9a8-0b83f1ca05fb", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "a4152057-a800-4adf-99ef-5c1a5b71c4f6", "type": "Legend"
                                }, {
                                    "attributes": {},
                                    "id": "d804fc38-78bf-4c55-af17-b8e77d8214af",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "962af6a8-5a8e-4ab1-addf-089ec7f83237",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "82f63384-adbd-4be8-8655-5df48aaffdd5", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "e014595d-e8ef-4a52-aed6-3c705b58545a",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "bcb5457b-f031-4b16-8dc7-1e60e260ec19", "type": "CDSView"}
                                    }, "id": "babb7c8c-bac3-4005-baf7-f1da1cff6a6f", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "59da5b20-a97f-4829-abfa-646de3277a51",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "babb7c8c-bac3-4005-baf7-f1da1cff6a6f",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "0ff91ae5-91bf-43aa-9e7d-87a5ab35f410", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "43fd85b5-ba56-4aad-8fe5-32cfcb3d03bf",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "f12a5597-6c8b-42c5-a88d-b18bfbc95376", "type": "Grid"
                                }, {
                                    "attributes": {},
                                    "id": "6b1935e7-b087-4342-948c-1849a4ff1949",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "59da5b20-a97f-4829-abfa-646de3277a51",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "dd8b0a6f-763f-4d1f-a21c-8b08687fcf1d", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "c2362a55-68e8-4ac2-80ae-1af6b4737459",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "080ec36b-ad4b-4881-a7dc-2295d149071b", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "376a35c0-2314-4ad8-9775-6d30f79a4009",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "59da5b20-a97f-4829-abfa-646de3277a51",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "34c8994a-3a87-4e1d-bc52-a8b7e5dad196", "type": "LinearAxis"
                                }, {
                                    "attributes": {},
                                    "id": "ab380476-693f-4c01-8357-f256f40629c5",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {},
                                    "id": "9faa8617-ced3-4bad-a47f-717af3d6e189",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "59f3f879-fbb1-4597-93f8-c7d4ba191c27",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "ab380476-693f-4c01-8357-f256f40629c5",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "43fd85b5-ba56-4aad-8fe5-32cfcb3d03bf",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "61624903-ae29-4d48-87ff-3ae4fe22dbde", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "c407609c-38c2-41a8-a289-84c794a559a8",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "bdc76d55-6912-43aa-ae2c-a8e864962c18", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "a5c534ca-111c-413f-a0d2-10cf908ebed2",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "1c12f904-c4e1-40f8-8f89-141af5196167", "type": "CDSView"}
                                    }, "id": "a4a7343a-2a64-492b-9c51-1c72ee299d17", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "2d9d8da6-13c3-4671-9364-b987ab2b880d",
                                    "type": "HelpTool"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "c407609c-38c2-41a8-a289-84c794a559a8",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "1c12f904-c4e1-40f8-8f89-141af5196167", "type": "CDSView"
                                }, {
                                    "attributes": {},
                                    "id": "3b22bf21-a0a8-4772-b14b-9040dde470b0",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "d4d5f8c3-cfb3-4802-9024-c24937c60884",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "e1b02b4b-877e-4ec6-a9a8-0b83f1ca05fb", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "bdc76d55-6912-43aa-ae2c-a8e864962c18", "type": "Line"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["5.83", "5.83", "6.22", "5.83", "6.80", "7.00", "7.97", "9.14", "9.33", "8.75", "8.75", "7.78", "8.36", "9.14", "8.16", "7.39", "7.78", "8.94", "8.75", "9.14", "9.33", "8.94", "8.55", "8.75", "8.75", "8.36", "8.94", "8.55", "8.36", "8.16", "7.78", "7.39", "7.58", "7.19", "7.78", "8.55", "8.55", "9.52", "9.14", "10.50", "10.69", "10.69", "10.50", "10.89", "10.50", "10.69", "11.08", "10.69", "11.27", "10.89", "10.89", "10.69", "12.44", "11.27", "11.47", "11.27", "12.05", "11.08", "10.30", "11.08", "11.66", "10.69", "11.47", "11.08", "10.50", "10.69", "11.08", "11.08", "10.89", "10.69", "10.50", "10.11", "9.91", "10.69", "10.30", "10.11", "9.91", "9.72", "9.91", "10.11", "10.11", "9.91", "9.72", "8.75", "9.33", "9.33", "8.94", "9.14", "9.52", "10.89", "10.89", "10.89", "11.47", "11.08", "10.11", "10.69", "10.11", "10.50", "11.27", "11.66", "11.66", "11.27", "11.86", "11.47", "11.86", "11.27", "11.08", "10.69", "11.27", "10.69", "12.25", "11.86", "10.69", "11.27", "11.47", "12.83", "12.05", "11.86", "12.44", "13.02", "13.22", "11.86", "13.22", "12.44", "11.27", "11.66", "12.05", "11.27", "11.66", "11.47", "10.89", "10.89", "11.27", "12.05", "12.05", "12.05", "12.44", "11.27", "10.50", "10.89", "11.27", "10.89", "10.89", "11.66", "10.69", "9.52", "9.14", "9.33", "9.33", "9.72", "9.72", "9.33", "8.75", "8.75", "8.94", "7.78", "8.36", "9.14", "8.55", "7.97", "8.36", "8.94", "8.75", "9.14", "9.14", "8.55", "8.36", "8.75", "8.75", "8.55", "8.94", "9.14", "8.75", "8.55", "7.97", "7.78", "7.78", "7.97", "8.36", "8.36", "7.78", "7.78", "7.58", "7.58", "7.58", "7.19", "7.19", "6.61", "6.22", "6.22", "6.61", "7.19", "7.00", "7.00", "7.00", "6.41", "5.64", "4.86", "4.47", "4.67", "5.25", "6.03", "6.22", "5.64", "5.05", "5.25", "5.05", "4.67", "5.64", "5.64", "6.03", "7.58", "7.58", "7.58", "6.61", "6.80", "6.80", "6.41", "7.00", "6.61", "6.41", "6.41", "5.83", "6.22", "6.03", "6.41", "6.22", "6.22", "5.83", "5.83", "5.64", "5.64", "5.44", "5.25", "5.64", "5.64", "5.44", "5.64"]
                                        }
                                    }, "id": "fbdbd222-d9ce-47b6-a06b-faba0b28e7c0", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {},
                                    "id": "b57fcf2c-062f-4825-9127-b768c7b1a7ea",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "376a35c0-2314-4ad8-9775-6d30f79a4009",
                                    "type": "DatetimeTickFormatter"
                                }, {
                                    "attributes": {
                                        "below": [{
                                            "id": "34c8994a-3a87-4e1d-bc52-a8b7e5dad196",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "61624903-ae29-4d48-87ff-3ae4fe22dbde",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "34c8994a-3a87-4e1d-bc52-a8b7e5dad196",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "dd8b0a6f-763f-4d1f-a21c-8b08687fcf1d",
                                            "type": "Grid"
                                        }, {
                                            "id": "61624903-ae29-4d48-87ff-3ae4fe22dbde",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "f12a5597-6c8b-42c5-a88d-b18bfbc95376",
                                            "type": "Grid"
                                        }, {
                                            "id": "c2362a55-68e8-4ac2-80ae-1af6b4737459",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "a4152057-a800-4adf-99ef-5c1a5b71c4f6",
                                            "type": "Legend"
                                        }, {
                                            "id": "a4a7343a-2a64-492b-9c51-1c72ee299d17",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "babb7c8c-bac3-4005-baf7-f1da1cff6a6f",
                                            "type": "GlyphRenderer"
                                        }, {"id": "d4d5f8c3-cfb3-4802-9024-c24937c60884", "type": "GlyphRenderer"}],
                                        "title": {"id": "da8af53a-d932-4aca-9124-682da5fc8df7", "type": "Title"},
                                        "toolbar": {
                                            "id": "ae6d3a58-882a-442f-87f6-3aaa02c470d8",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "59f3f879-fbb1-4597-93f8-c7d4ba191c27",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "d804fc38-78bf-4c55-af17-b8e77d8214af",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "627828a7-299c-4f46-b34a-a83965732002",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "3b22bf21-a0a8-4772-b14b-9040dde470b0",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "5e22c665-ac91-4814-b454-7e231675d9f5",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "6b1935e7-b087-4342-948c-1849a4ff1949",
                                            "type": "PanTool"
                                        }, {
                                            "id": "9593c3cd-e7ad-48e4-b390-7d1517801de4",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "080ec36b-ad4b-4881-a7dc-2295d149071b",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "b57fcf2c-062f-4825-9127-b768c7b1a7ea",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "9faa8617-ced3-4bad-a47f-717af3d6e189",
                                            "type": "ResetTool"
                                        }, {"id": "2d9d8da6-13c3-4671-9364-b987ab2b880d", "type": "HelpTool"}]
                                    }, "id": "ae6d3a58-882a-442f-87f6-3aaa02c470d8", "type": "Toolbar"
                                }, {
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "a4a7343a-2a64-492b-9c51-1c72ee299d17",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "29652f75-cef2-406b-975f-aaa134f76b47", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "43fd85b5-ba56-4aad-8fe5-32cfcb3d03bf",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "e014595d-e8ef-4a52-aed6-3c705b58545a", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "82f63384-adbd-4be8-8655-5df48aaffdd5", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "9593c3cd-e7ad-48e4-b390-7d1517801de4",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "4af3832d-ecf5-4012-9c08-cfc68a68cbae", "type": "Line"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "627828a7-299c-4f46-b34a-a83965732002",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "fbdbd222-d9ce-47b6-a06b-faba0b28e7c0",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "4af3832d-ecf5-4012-9c08-cfc68a68cbae", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "87d1edbd-0e70-4eeb-a128-029aab478aac",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "17e394f1-344f-4a3a-a29c-0cc9df07d584", "type": "CDSView"}
                                    }, "id": "d4d5f8c3-cfb3-4802-9024-c24937c60884", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "962af6a8-5a8e-4ab1-addf-089ec7f83237",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "bcb5457b-f031-4b16-8dc7-1e60e260ec19", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "fbdbd222-d9ce-47b6-a06b-faba0b28e7c0",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "17e394f1-344f-4a3a-a29c-0cc9df07d584", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["6.61", "5.05", "5.25", "3.69", "4.67", "5.44", "4.28", "5.64", "4.67", "4.47", "4.67", "4.47", "4.47", "4.67", "4.67", "4.67", "4.47", "4.67", "4.47", "5.05", "4.86", "5.25", "4.86", "4.86", "4.67", "3.89", "3.89", "3.50", "4.08", "4.28", "4.47", "4.47", "4.86", "4.28", "5.64", "4.67", "4.47", "5.05", "4.86", "6.03", "6.80", "7.19", "6.41", "6.61", "6.41", "7.00", "7.39", "8.36", "7.78", "7.19", "7.58", "6.80", "7.39", "7.78", "7.97", "6.61", "6.61", "6.61", "5.83", "6.80", "5.83", "5.25", "5.64", "6.61", "6.61", "5.83", "6.41", "5.83", "5.05", "6.22", "5.25", "5.83", "6.22", "5.44", "6.03", "6.22", "6.80", "6.41", "5.64", "6.03", "6.03", "5.64", "5.44", "5.64", "4.67", "5.64", "4.67", "4.08", "4.67", "4.28", "4.28", "5.25", "5.83", "4.28", "5.05", "4.67", "6.22", "5.25", "4.47", "5.44", "5.83", "5.83", "6.22", "5.05", "4.47", "4.47", "5.44", "5.05", "5.44", "4.28", "5.64", "5.25", "5.64", "4.67", "5.05", "5.83", "5.05", "4.67", "6.41", "6.80", "4.47", "5.05", "5.05", "4.08", "6.22", "5.05", "6.41", "8.16", "6.41", "4.86", "6.22", "5.05", "4.08", "6.03", "5.44", "5.44", "4.86", "5.25", "4.47", "3.69", "4.28", "3.89", "4.67", "4.08", "5.05", "5.05", "5.25", "4.47", "4.08", "5.44", "4.08", "4.86", "4.86", "4.67", "4.86", "5.25", "6.61", "4.67", "3.69", "6.22", "6.22", "7.97", "7.00", "6.41", "8.55", "5.44", "6.61", "6.41", "7.19", "7.58", "6.41", "6.22", "7.39", "9.14", "9.14", "7.00", "6.80", "6.22", "7.19", "8.36", "5.83", "6.80", "7.78", "8.55", "8.36", "6.61", "7.19", "8.16", "6.80", "6.61", "5.25", "6.03", "6.61", "6.80", "6.22", "6.41", "7.00", "6.03", "6.22", "6.41", "7.78", "4.47", "4.47", "4.67", "5.83", "6.80", "7.00", "7.00", "7.19", "6.22", "7.19", "8.16", "8.94", "8.75", "9.33", "9.14", "7.19", "9.14", "7.19", "9.33", "8.94", "8.55", "8.75", "7.19", "7.39", "6.61", "6.80", "6.22", "5.64", "6.03", "5.64", "6.22", "6.61", "6.22", "6.03", "6.22", "6.22", "6.22", "5.64"]
                                        }
                                    }, "id": "c407609c-38c2-41a8-a289-84c794a559a8", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "c2362a55-68e8-4ac2-80ae-1af6b4737459", "type": "BoxAnnotation"
                                }], "root_ids": ["5e22c665-ac91-4814-b454-7e231675d9f5"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "9f670bcf-42cd-48e4-8047-e1e84c68a20a",
                        "elementid": "072f3f76-f774-4a60-98bd-e602912b5567",
                        "modelid": "5e22c665-ac91-4814-b454-7e231675d9f5"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();

(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "ec5e8658-f814-4085-b41a-bb03600f6fc4": {
                            "roots": {
                                "references": [{
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "3834effe-38f7-4a98-a5b9-e6833faa6c34",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "16c3936e-6ef1-4438-9424-4e309e800f26", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "c8facf57-b174-4c8e-8a73-0f54c80be42a", "type": "BoxAnnotation"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["0.945", "0.951", "0.961", "0.938", "0.981", "1.001", "1.093", "0.951", "0.978", "1.001", "1.010", "1.014", "0.984", "0.965", "0.942", "0.968", "0.988", "1.024", "1.060", "1.096", "1.109", "1.152", "0.879", "1.227", "1.060", "1.056", "1.145", "1.073", "1.096", "1.155", "1.083", "1.125", "1.106", "1.220", "1.158", "1.191", "1.181", "1.243", "1.191", "1.289", "1.240", "1.243", "1.240", "1.257", "1.257", "1.257", "1.240", "1.247", "1.243", "1.247", "1.286", "1.296", "1.286", "1.289", "1.306", "1.289", "1.286", "1.283", "1.280", "1.276", "1.283", "1.296", "1.296", "1.296", "1.299", "1.299", "1.296", "1.286", "1.299", "1.335", "1.453", "1.417", "1.263", "1.293", "1.322", "1.325", "1.309", "1.316", "1.286", "1.306", "1.276", "1.270", "1.286", "1.322", "1.319", "1.381", "1.286", "1.237", "1.266", "1.240", "1.257", "1.260", "1.217", "1.253", "1.260", "1.184", "1.204", "1.204", "1.266", "1.250", "1.234", "1.247", "1.207", "1.207", "1.178", "1.198", "1.204", "1.184", "1.214", "1.214", "1.227", "1.237", "1.214", "1.237", "1.161", "1.214", "1.234", "1.240", "1.237", "1.224", "1.234", "1.214", "1.201", "1.237", "1.188", "1.181", "1.188", "1.194", "1.184", "1.184", "1.188", "1.191", "1.184", "1.184", "1.191", "1.191", "1.201", "1.217", "1.227", "1.237", "1.240", "1.234", "1.243", "1.247", "1.250", "1.260", "1.270", "1.276", "1.293", "1.302", "1.312", "1.325", "1.332", "1.352", "1.375", "1.371", "1.368", "1.378", "1.378", "1.375", "1.375", "1.385", "1.371", "1.398", "1.368", "1.378", "1.368", "1.371", "1.381", "1.378", "1.378", "1.352", "1.358", "1.352", "1.358", "1.371", "1.388", "1.388", "1.391", "1.401", "1.391", "1.381", "1.378", "1.394", "1.424", "1.463", "1.483", "1.480", "1.460", "1.444", "1.417", "1.411", "1.394", "1.388", "1.375", "1.365", "1.368", "1.375", "1.365", "1.362", "1.358", "1.358", "1.368", "1.371", "1.355", "1.368", "1.355", "1.332", "1.335", "1.342", "1.342", "1.348", "1.348", "1.342", "1.339", "1.335", "1.322", "1.329", "1.339", "1.342", "1.339", "1.339", "1.329", "1.319", "1.306", "1.299", "1.309", "1.312", "1.339", "1.348", "1.352", "1.352", "1.339", "1.332", "1.332", "1.335", "1.316", "1.312", "1.309"]
                                        }
                                    }, "id": "960aa51d-ecb0-469e-8e7c-cc71eaa14c92", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {},
                                    "id": "3a41c690-1729-4f24-8ff1-66aae345eb23",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {},
                                    "id": "878c1524-4805-4d88-89cf-4af614603d95",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {},
                                    "id": "d7a219f6-1aeb-48e3-9026-a606433dc2a5",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "173f7090-c702-49b1-889e-d7616d2632a3",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "f0749bf5-f4e7-4cab-af62-8372124f0a9f", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "1c45cfc1-044a-41be-b06d-73ab766b6498",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "a6de17c4-0f86-49e9-95ad-fa7da1879b1b", "type": "CDSView"}
                                    }, "id": "440a9ca5-dba1-4a0e-8d27-1c81e0026554", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "fbd1535d-6ed9-4665-a10f-b6bdac714d18",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "ac266ba2-d8c8-403d-993c-073a0341872e",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "3a41c690-1729-4f24-8ff1-66aae345eb23",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "287ee1ff-98ba-415d-95eb-9806f9826ff4", "type": "LinearAxis"
                                }, {
                                    "attributes": {},
                                    "id": "357188b8-d3fe-44be-911f-bfb5b549063f",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "a21136f7-12ba-4cd5-acd6-daa2d5eb1b8b", "type": "Line"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "16c3936e-6ef1-4438-9424-4e309e800f26",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "4e9d2c2e-d6e8-4e4e-bdf5-ec62fcfc0619",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "ecfcb604-d9ed-4c63-834f-7f526921a00a",
                                            "type": "LegendItem"
                                        }, {"id": "3db56d90-a61c-4b8a-b780-1836892f0b91", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "245aeb9e-9099-4c88-a09c-194b931e4cae", "type": "Legend"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "00d041d4-7ebc-4ab6-b1a0-0972d2a5b06f",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "below": [{
                                            "id": "86f3c9cb-8bd3-454d-8416-e1973298a125",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "287ee1ff-98ba-415d-95eb-9806f9826ff4",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "86f3c9cb-8bd3-454d-8416-e1973298a125",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "10c295d7-ee56-4541-94e4-e618cd43567a",
                                            "type": "Grid"
                                        }, {
                                            "id": "287ee1ff-98ba-415d-95eb-9806f9826ff4",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "fb370379-2d2e-46ec-9749-a353133f4816",
                                            "type": "Grid"
                                        }, {
                                            "id": "c8facf57-b174-4c8e-8a73-0f54c80be42a",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "245aeb9e-9099-4c88-a09c-194b931e4cae",
                                            "type": "Legend"
                                        }, {
                                            "id": "3834effe-38f7-4a98-a5b9-e6833faa6c34",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "440a9ca5-dba1-4a0e-8d27-1c81e0026554",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "243b398a-3552-432d-8713-aa8582704f81",
                                            "type": "GlyphRenderer"
                                        }, {"id": "dd7425b6-4250-43ef-b1a9-d72969ef5df0", "type": "GlyphRenderer"}],
                                        "title": {"id": "1988310d-89e5-4c6c-95cd-55779457afdc", "type": "Title"},
                                        "toolbar": {
                                            "id": "7751cc66-2e45-467c-9c9e-69c58cc910d3",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "59d67f21-a773-4669-8f91-087cef01ad13",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "fbd1535d-6ed9-4665-a10f-b6bdac714d18",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "00d041d4-7ebc-4ab6-b1a0-0972d2a5b06f",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "2882167d-3491-487e-a693-d44a8d5bfe99",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "960aa51d-ecb0-469e-8e7c-cc71eaa14c92",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "a21136f7-12ba-4cd5-acd6-daa2d5eb1b8b", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "2e71215a-7a1d-42eb-9d4a-333247083cdb",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "d17512cc-1d81-42cc-8a43-a37b769d019b", "type": "CDSView"}
                                    }, "id": "3834effe-38f7-4a98-a5b9-e6833faa6c34", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "76f5fc21-211f-46b4-ab96-eecded92a094", "type": "Line"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "440a9ca5-dba1-4a0e-8d27-1c81e0026554",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "4e9d2c2e-d6e8-4e4e-bdf5-ec62fcfc0619", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "a41f170b-8b4c-457a-b18b-8c92388e36a3",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "dff648ff-c37d-4c12-b396-d9d37edad086",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "77a98d1c-516b-436b-9235-e092ff1f6d06", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "f573744a-de5b-461c-b9ff-3b6e34e12027",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "729dd031-7f3e-4cac-9029-4087cd6c2af4", "type": "CDSView"}
                                    }, "id": "dd7425b6-4250-43ef-b1a9-d72969ef5df0", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["1.102", "1.125", "1.135", "1.119", "1.165", "1.194", "1.188", "1.188", "1.243", "1.217", "1.237", "1.201", "1.220", "1.165", "1.198", "1.201", "1.266", "1.302", "1.319", "1.329", "1.325", "1.339", "1.368", "1.273", "1.312", "1.437", "1.325", "1.375", "1.394", "1.401", "1.401", "1.440", "1.440", "1.424", "1.473", "1.493", "1.496", "1.496", "1.516", "1.509", "1.568", "1.552", "1.542", "1.529", "1.519", "1.526", "1.529", "1.526", "1.545", "1.565", "1.581", "1.572", "1.585", "1.591", "1.572", "1.572", "1.555", "1.555", "1.552", "1.555", "1.535", "1.562", "1.542", "1.535", "1.522", "1.519", "1.519", "1.542", "1.535", "1.535", "1.558", "1.467", "1.529", "1.506", "1.549", "1.512", "1.555", "1.506", "1.512", "1.516", "1.483", "1.460", "1.447", "1.437", "1.467", "1.362", "1.414", "1.430", "1.411", "1.411", "1.411", "1.381", "1.404", "1.371", "1.381", "1.368", "1.362", "1.371", "1.378", "1.355", "1.365", "1.342", "1.345", "1.322", "1.299", "1.306", "1.302", "1.325", "1.322", "1.309", "1.322", "1.342", "1.335", "1.339", "1.316", "1.342", "1.335", "1.329", "1.329", "1.335", "1.332", "1.322", "1.329", "1.296", "1.280", "1.283", "1.312", "1.293", "1.260", "1.283", "1.299", "1.299", "1.299", "1.309", "1.312", "1.312", "1.348", "1.358", "1.348", "1.365", "1.375", "1.388", "1.391", "1.411", "1.388", "1.414", "1.407", "1.417", "1.411", "1.424", "1.444", "1.437", "1.470", "1.490", "1.467", "1.473", "1.516", "1.490", "1.480", "1.473", "1.473", "1.490", "1.483", "1.463", "1.476", "1.457", "1.467", "1.480", "1.490", "1.476", "1.480", "1.480", "1.483", "1.493", "1.499", "1.522", "1.549", "1.549", "1.572", "1.565", "1.535", "1.522", "1.535", "1.568", "1.608", "1.604", "1.608", "1.594", "1.568", "1.562", "1.555", "1.499", "1.516", "1.483", "1.467", "1.470", "1.470", "1.483", "1.473", "1.460", "1.476", "1.493", "1.486", "1.457", "1.457", "1.444", "1.437", "1.414", "1.421", "1.430", "1.430", "1.437", "1.407", "1.417", "1.417", "1.404", "1.401", "1.414", "1.407", "1.407", "1.421", "1.378", "1.378", "1.371", "1.362", "1.385", "1.411", "1.417", "1.447", "1.444", "1.440", "1.430", "1.434", "1.453", "1.411", "1.398", "1.391", "1.401"]
                                        }
                                    }, "id": "dff648ff-c37d-4c12-b396-d9d37edad086", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "77a98d1c-516b-436b-9235-e092ff1f6d06", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "ac266ba2-d8c8-403d-993c-073a0341872e",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "3a41c690-1729-4f24-8ff1-66aae345eb23",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "fb370379-2d2e-46ec-9749-a353133f4816", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "c8facf57-b174-4c8e-8a73-0f54c80be42a",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "51584c17-b4db-4325-8749-2f89ef8d738e", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "59d67f21-a773-4669-8f91-087cef01ad13",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["0.407", "0.403", "0.407", "0.398", "0.389", "0.376", "0.403", "0.398", "0.341", "0.385", "0.354", "0.376", "0.372", "0.398", "0.368", "0.381", "0.363", "0.381", "0.350", "0.359", "0.389", "0.372", "0.368", "0.376", "0.389", "0.372", "0.368", "0.398", "0.411", "0.407", "0.394", "0.407", "0.429", "0.420", "0.433", "0.438", "0.433", "0.425", "0.381", "0.446", "0.499", "0.468", "0.495", "0.482", "0.503", "0.495", "0.521", "0.508", "0.521", "0.547", "0.534", "0.539", "0.560", "0.556", "0.587", "0.574", "0.565", "0.604", "0.613", "0.604", "0.604", "0.613", "0.609", "0.626", "0.657", "0.657", "0.626", "0.661", "0.670", "0.692", "0.696", "0.679", "0.670", "0.696", "0.714", "0.714", "0.731", "0.727", "0.758", "0.745", "0.731", "0.749", "0.749", "0.740", "0.749", "0.780", "0.758", "0.758", "0.780", "0.788", "0.788", "0.771", "0.797", "0.810", "0.784", "0.806", "0.797", "0.801", "0.810", "0.780", "0.815", "0.806", "0.815", "0.797", "0.806", "0.810", "0.815", "0.810", "0.819", "0.845", "0.688", "0.815", "0.793", "0.793", "0.810", "0.788", "0.819", "0.819", "0.819", "0.801", "0.797", "0.810", "0.788", "0.784", "0.819", "0.806", "0.784", "0.745", "0.764", "0.758", "0.758", "0.774", "0.768", "0.755", "0.755", "0.745", "0.741", "0.725", "0.738", "0.745", "0.732", "0.735", "0.728", "0.715", "0.735", "0.728", "0.715", "0.719", "0.712", "0.705", "0.709", "0.702", "0.689", "0.689", "0.692", "0.686", "0.696", "0.696", "0.689", "0.699", "0.699", "0.696", "0.699", "0.686", "0.653", "0.627", "0.610", "0.597", "0.584", "0.561", "0.571", "0.564", "0.574", "0.627", "0.676", "0.709", "0.732", "0.758", "0.764", "0.768", "0.787", "0.794", "0.791", "0.791", "0.801", "0.804", "0.804", "0.807", "0.810", "0.804", "0.807", "0.814", "0.794", "0.804", "0.801", "0.797", "0.794", "0.794", "0.797", "0.804", "0.801", "0.807", "0.810", "0.823", "0.823", "0.830", "0.827", "0.823", "0.833", "0.837", "0.843", "0.846", "0.840", "0.837", "0.833", "0.837", "0.843", "0.850", "0.846", "0.850", "0.853", "0.856", "0.860", "0.860", "0.863", "0.863", "0.869", "0.876", "0.879", "0.876", "0.879", "0.869", "0.869", "0.873", "0.873", "0.879", "0.886", "0.879", "0.876"]
                                        }
                                    }, "id": "ab9fd8fd-3480-46de-ab2e-42f93f999491", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "1c45cfc1-044a-41be-b06d-73ab766b6498", "type": "Line"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["1.040", "1.099", "1.109", "1.102", "1.132", "1.201", "1.207", "1.243", "1.260", "1.276", "1.283", "1.296", "1.286", "1.273", "1.283", "1.302", "1.283", "1.306", "1.332", "1.345", "1.332", "1.368", "1.421", "1.444", "1.447", "1.437", "1.490", "1.512", "1.519", "1.562", "1.575", "1.598", "1.598", "1.634", "1.660", "1.696", "1.719", "1.729", "1.732", "1.742", "1.736", "1.814", "1.798", "1.860", "1.818", "1.831", "1.854", "1.900", "1.896", "1.870", "1.834", "1.870", "1.847", "1.834", "1.811", "1.775", "1.798", "1.821", "1.821", "1.837", "1.854", "1.821", "1.834", "1.831", "1.844", "1.837", "1.847", "1.801", "1.752", "1.791", "1.791", "1.804", "1.791", "1.781", "1.736", "1.736", "1.719", "1.699", "1.680", "1.696", "1.673", "1.650", "1.627", "1.644", "1.621", "1.634", "1.637", "1.588", "1.578", "1.549", "1.549", "1.549", "1.509", "1.516", "1.503", "1.450", "1.460", "1.483", "1.417", "1.440", "1.427", "1.450", "1.447", "1.440", "1.417", "1.424", "1.401", "1.404", "1.378", "1.404", "1.381", "1.394", "1.411", "1.391", "1.391", "1.388", "1.394", "1.421", "1.394", "1.368", "1.371", "1.352", "1.381", "1.365", "1.335", "1.322", "1.348", "1.345", "1.339", "1.345", "1.319", "1.325", "1.358", "1.368", "1.391", "1.398", "1.401", "1.407", "1.440", "1.440", "1.450", "1.444", "1.450", "1.470", "1.493", "1.512", "1.463", "1.467", "1.496", "1.496", "1.503", "1.512", "1.539", "1.552", "1.585", "1.591", "1.572", "1.578", "1.598", "1.588", "1.555", "1.532", "1.516", "1.539", "1.555", "1.545", "1.516", "1.545", "1.572", "1.542", "1.549", "1.529", "1.565", "1.552", "1.598", "1.578", "1.598", "1.650", "1.614", "1.621", "1.624", "1.673", "1.683", "1.667", "1.617", "1.558", "1.572", "1.558", "1.545", "1.496", "1.473", "1.486", "1.503", "1.532", "1.503", "1.529", "1.519", "1.516", "1.539", "1.503", "1.522", "1.493", "1.496", "1.516", "1.519", "1.473", "1.417", "1.463", "1.453", "1.499", "1.499", "1.453", "1.444", "1.440", "1.398", "1.375", "1.348", "1.381", "1.368", "1.407", "1.388", "1.434", "1.430", "1.414", "1.450", "1.417", "1.417", "1.424", "1.450", "1.447", "1.460", "1.411", "1.398", "1.378", "1.394", "1.375", "1.339", "1.329", "1.325"]
                                        }
                                    }, "id": "173f7090-c702-49b1-889e-d7616d2632a3", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "878c1524-4805-4d88-89cf-4af614603d95",
                                            "type": "PanTool"
                                        }, {
                                            "id": "a41f170b-8b4c-457a-b18b-8c92388e36a3",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "51584c17-b4db-4325-8749-2f89ef8d738e",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "6a0aba02-ee08-4cfc-9bde-44907a812dd2",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "357188b8-d3fe-44be-911f-bfb5b549063f",
                                            "type": "ResetTool"
                                        }, {"id": "f30f8b8e-e643-4f74-aba7-33a725feb346", "type": "HelpTool"}]
                                    }, "id": "7751cc66-2e45-467c-9c9e-69c58cc910d3", "type": "Toolbar"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "3676dfff-7f6b-4e66-8dfa-888375978f0c", "type": "Line"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "ab9fd8fd-3480-46de-ab2e-42f93f999491",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "76d05b13-f5de-413a-9540-82e8010dd41c", "type": "CDSView"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "0cc77b3f-0525-477f-bcd9-0ef0168ffdc8",
                                    "type": "DatetimeTickFormatter"
                                }, {
                                    "attributes": {"plot": null, "text": "water_level"},
                                    "id": "1988310d-89e5-4c6c-95cd-55779457afdc",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "dd7425b6-4250-43ef-b1a9-d72969ef5df0",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "3db56d90-a61c-4b8a-b780-1836892f0b91", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "ab9fd8fd-3480-46de-ab2e-42f93f999491",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "76f5fc21-211f-46b4-ab96-eecded92a094", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "3676dfff-7f6b-4e66-8dfa-888375978f0c",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "76d05b13-f5de-413a-9540-82e8010dd41c", "type": "CDSView"}
                                    }, "id": "243b398a-3552-432d-8713-aa8582704f81", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "f0749bf5-f4e7-4cab-af62-8372124f0a9f", "type": "Line"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "dff648ff-c37d-4c12-b396-d9d37edad086",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "729dd031-7f3e-4cac-9029-4087cd6c2af4", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "f573744a-de5b-461c-b9ff-3b6e34e12027", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "6a0aba02-ee08-4cfc-9bde-44907a812dd2",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {
                                        "label": {"value": "lexington"},
                                        "renderers": [{
                                            "id": "243b398a-3552-432d-8713-aa8582704f81",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "ecfcb604-d9ed-4c63-834f-7f526921a00a", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "d7a219f6-1aeb-48e3-9026-a606433dc2a5",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "10c295d7-ee56-4541-94e4-e618cd43567a", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "173f7090-c702-49b1-889e-d7616d2632a3",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "a6de17c4-0f86-49e9-95ad-fa7da1879b1b", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "0cc77b3f-0525-477f-bcd9-0ef0168ffdc8",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "d7a219f6-1aeb-48e3-9026-a606433dc2a5",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "86f3c9cb-8bd3-454d-8416-e1973298a125", "type": "LinearAxis"
                                }, {
                                    "attributes": {},
                                    "id": "2882167d-3491-487e-a693-d44a8d5bfe99",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "2e71215a-7a1d-42eb-9d4a-333247083cdb", "type": "Line"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "960aa51d-ecb0-469e-8e7c-cc71eaa14c92",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "d17512cc-1d81-42cc-8a43-a37b769d019b", "type": "CDSView"
                                }, {
                                    "attributes": {},
                                    "id": "f30f8b8e-e643-4f74-aba7-33a725feb346",
                                    "type": "HelpTool"
                                }], "root_ids": ["c10f85dd-8cc0-41c0-bc5e-1986fe75db19"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "ec5e8658-f814-4085-b41a-bb03600f6fc4",
                        "elementid": "d5cee2f0-9178-432e-a8bd-cc412f6dd9c8",
                        "modelid": "c10f85dd-8cc0-41c0-bc5e-1986fe75db19"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();


(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "a153ec13-04cd-4123-931a-97973bc602aa": {
                            "roots": {
                                "references": [{
                                    "attributes": {},
                                    "id": "933593e4-450e-4e68-a037-508965f9a1ba",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {},
                                    "id": "2a552521-c28f-45c4-a98c-a4f3e5bb61f7",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "b9369de3-45e8-4ed0-a8f7-719f1d50bc3b", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "fba14314-a67a-46c2-a3e1-47dd7d363fc0", "type": "Line"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "a83fba5d-69ac-4635-9e7a-6cfe643bba0d",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "843a9270-1209-4b17-978e-c3ae78ff82f1", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "5a942fe5-9822-4475-aee8-ce00e6d0a57f",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "6b18b3db-90a9-4fed-bb75-51ebbb6054de", "type": "CDSView"}
                                    }, "id": "d26e97cf-1f73-4153-8b17-c05c43f998ac", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "080b5cbb-0b1c-4398-b148-e8fd4edd048f",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "684ab688-1815-416b-b6e9-f700937df8e3", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "fba14314-a67a-46c2-a3e1-47dd7d363fc0",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "435e8703-eb64-4a95-80c4-8e6f15c6e5a2", "type": "CDSView"}
                                    }, "id": "22d674ba-f05a-472d-8722-65267472cd65", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "1ac0179b-3342-4b1c-ba92-9297fef243ae",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "06fb3d5a-d74c-4fb6-87f5-dd575a4adcf0",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "72c9cdff-2699-405f-abcb-1af7280e31a6", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "label": {"value": "lexington"},
                                        "renderers": [{
                                            "id": "fe1543dc-764c-4ee1-b5fa-f7a27b1c05fa",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "8a6f0a56-3d9f-498b-b0c1-e281363bcc29", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "9ba3c2f1-3310-4dcc-962c-ba90a51b332c",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "below": [{
                                            "id": "ed25c39a-faff-4b36-b554-5eb24d905e0a",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "285b125b-d4c9-4a18-bad2-cc80a7e36acb",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "ed25c39a-faff-4b36-b554-5eb24d905e0a",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "2bc222ac-27c2-4283-b3d2-8c5cf989bfd0",
                                            "type": "Grid"
                                        }, {
                                            "id": "285b125b-d4c9-4a18-bad2-cc80a7e36acb",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "c04b5d20-c784-4520-9a44-65d9a4660170",
                                            "type": "Grid"
                                        }, {
                                            "id": "e0b1c01d-7694-49f7-8a7a-a147e8bf9bce",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "cab2ffb3-54d6-498d-83d1-9aedaaec3eb7",
                                            "type": "Legend"
                                        }, {
                                            "id": "d26e97cf-1f73-4153-8b17-c05c43f998ac",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "22d674ba-f05a-472d-8722-65267472cd65",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "fe1543dc-764c-4ee1-b5fa-f7a27b1c05fa",
                                            "type": "GlyphRenderer"
                                        }, {"id": "240e285d-4a0c-4a46-9ee4-d465706da392", "type": "GlyphRenderer"}],
                                        "title": {"id": "95c4bf54-a14c-483e-8284-8b199f753dc9", "type": "Title"},
                                        "toolbar": {
                                            "id": "cfad34a8-6e67-4cab-bad8-2605399b7c9f",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "c3ac7991-939d-4df9-98a1-4875a1566897",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "b1eea5b2-2c4f-4343-8d9d-16e6ff5d67ee",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "ab5e5b8b-fe34-423f-bcf7-844134338f01",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "982f5ec4-4595-42ec-990e-88fbb12ee11e",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "9ba3c2f1-3310-4dcc-962c-ba90a51b332c",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "2bc222ac-27c2-4283-b3d2-8c5cf989bfd0", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "240e285d-4a0c-4a46-9ee4-d465706da392",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "414d9d5f-96c2-4a4b-9626-3f52abe23fd1", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "845d429b-5da4-40e9-a588-c25835d99480",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "9ba3c2f1-3310-4dcc-962c-ba90a51b332c",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "ed25c39a-faff-4b36-b554-5eb24d905e0a", "type": "LinearAxis"
                                }, {
                                    "attributes": {},
                                    "id": "a70d3fbb-dc26-42c7-9d1a-dc9b2118eb1a",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["72.0", "71.8", "71.6", "71.4", "71.1", "70.9", "70.7", "70.5", "70.3", "70.2", "70.3", "70.2", "70.2", "70.2", "70.0", "70.0", "70.0", "70.0", "69.8", "70.0", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.4", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.8", "69.6", "69.6", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.8", "69.6", "69.6", "69.6", "69.4", "69.4", "69.4", "69.4", "69.4", "69.4", "69.6", "69.6", "69.6", "69.4", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.4", "69.4", "69.3", "69.3", "69.3", "69.1", "68.9", "69.3", "69.3", "69.1", "69.3", "68.9", "68.5", "68.5", "68.5", "68.7", "68.4", "68.4", "68.4", "68.5", "68.4", "68.4", "68.4", "68.5", "68.4", "68.2", "68.4", "68.4", "68.2", "68.0", "67.8", "67.6", "67.8", "68.0", "68.0", "68.2", "68.2", "68.0", "67.8", "67.6", "67.6", "67.6", "67.6", "67.6", "67.8", "67.8", "67.6", "67.6", "67.6", "67.6", "67.6", "67.8", "67.6", "67.8", "67.8", "67.8", "67.8", "67.8", "68.0", "68.0", "68.2", "68.2", "68.2", "68.2", "68.2", "68.2", "68.2", "68.2", "68.7", "68.7", "69.8", "70.3", "70.7", "70.9", "71.1", "71.2", "71.6", "72.0", "71.6", "71.6", "72.3", "73.2", "73.2", "73.4", "73.4", "73.4", "73.4", "73.2", "73.4", "73.4", "73.6", "73.8", "73.8", "73.6", "73.9", "73.6", "73.9", "73.6", "73.9", "73.9", "74.7", "74.5", "74.7", "74.5", "74.5", "74.5", "74.7", "74.7", "74.7", "74.8", "75.0", "75.2", "75.2", "74.8", "75.2", "74.7", "74.5", "74.5", "74.1", "74.3", "75.0", "75.2", "75.2", "75.4", "75.6", "75.6", "75.2", "74.8", "74.1", "74.3", "74.3", "74.3", "73.9", "74.1", "74.1", "73.9", "73.9", "74.1", "73.9", "74.1", "73.9", "73.8", "73.8", "73.8", "73.6", "73.6", "73.4"]
                                        }
                                    }, "id": "06fb3d5a-d74c-4fb6-87f5-dd575a4adcf0", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "c3ac7991-939d-4df9-98a1-4875a1566897",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "e0b1c01d-7694-49f7-8a7a-a147e8bf9bce", "type": "BoxAnnotation"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["72.0", "71.8", "71.8", "71.8", "71.6", "71.6", "71.6", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.6", "71.4", "71.4", "71.4", "71.4", "71.4", "71.6", "71.6", "71.6", "71.6", "71.4", "71.6", "71.4", "71.4", "71.4", "71.4", "71.6", "71.6", "71.4", "71.4", "71.4", "71.4", "71.6", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.8", "71.6", "71.6", "71.8", "71.6", "71.4", "71.6", "71.6", "71.8", "71.6", "71.8", "71.8", "71.6", "71.6", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.4", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.4", "71.6", "71.8", "71.6", "71.6", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.8", "71.6", "71.6", "71.6", "71.8", "71.6", "71.6", "71.6", "71.8", "71.6", "71.6", "71.6", "71.6", "71.8", "71.6", "71.6", "71.6", "71.4", "71.4", "71.8", "71.6", "71.6", "71.8", "71.6", "71.8", "71.6", "71.6", "71.8", "71.6", "71.6", "71.8", "71.8", "71.6", "71.6", "71.8", "71.8", "71.6", "71.8", "71.8", "71.8", "71.8", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.8", "71.8", "71.8", "72.0", "72.1", "72.1", "72.1", "72.3", "72.7", "72.7", "73.0", "73.0", "73.2", "73.0", "73.0", "73.0", "73.2", "73.0", "72.5", "72.3", "72.5", "72.5", "72.5", "72.7", "73.0", "72.9", "72.9", "72.9", "72.9", "72.9", "73.2", "73.4", "73.6", "73.6", "73.4", "73.4", "73.4", "73.4", "73.4", "73.0", "72.9", "72.7", "72.7", "72.5", "72.5", "72.5", "72.5", "72.3", "72.5", "72.5", "72.3", "72.3", "72.5", "72.3", "72.5", "72.3", "72.3", "72.5", "72.3", "72.1", "72.1", "72.1", "72.3", "72.3", "72.3", "72.5", "72.5", "72.3", "72.3", "72.3", "72.3", "72.5", "72.5", "72.7", "72.7", "72.7", "72.9", "72.9", "72.7", "72.7", "72.7", "72.9", "72.9", "72.9", "72.7", "72.9", "72.9", "72.9", "72.9", "72.9", "72.9", "72.7", "72.7", "72.9", "72.9", "72.7"]
                                        }
                                    }, "id": "080b5cbb-0b1c-4398-b148-e8fd4edd048f", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "1ac0179b-3342-4b1c-ba92-9297fef243ae",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "74a10097-ab1f-4c17-ab28-28d764d7693d",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "285b125b-d4c9-4a18-bad2-cc80a7e36acb", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "d26e97cf-1f73-4153-8b17-c05c43f998ac",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "2c975027-9907-4c8c-b8a1-c5aaddebd24c", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "843a9270-1209-4b17-978e-c3ae78ff82f1", "type": "Line"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "25f8c410-50ac-40f4-9fb0-b5c32fab3fd6",
                                            "type": "PanTool"
                                        }, {
                                            "id": "933593e4-450e-4e68-a037-508965f9a1ba",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "61a7eb91-46fb-40b5-9044-7417b5e10b16",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "2a552521-c28f-45c4-a98c-a4f3e5bb61f7",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "a70d3fbb-dc26-42c7-9d1a-dc9b2118eb1a",
                                            "type": "ResetTool"
                                        }, {"id": "735df74b-1281-4ca3-b437-fbc9937bbefe", "type": "HelpTool"}]
                                    }, "id": "cfad34a8-6e67-4cab-bad8-2605399b7c9f", "type": "Toolbar"
                                }, {
                                    "attributes": {},
                                    "id": "982f5ec4-4595-42ec-990e-88fbb12ee11e",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {},
                                    "id": "b1eea5b2-2c4f-4343-8d9d-16e6ff5d67ee",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "562882c4-5e1c-43a7-ae81-52d821ac595c", "type": "Line"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "0c113373-2e67-404d-b4bc-cea6ada82139",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "8704eeb8-53ad-4aa2-8176-24342176d9f2", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "b9369de3-45e8-4ed0-a8f7-719f1d50bc3b",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "92f6a636-ff53-44ff-a1a9-7a2579deb558", "type": "CDSView"}
                                    }, "id": "240e285d-4a0c-4a46-9ee4-d465706da392", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "06fb3d5a-d74c-4fb6-87f5-dd575a4adcf0",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "4f665613-8c72-4d8f-a0ab-f31e15cc1221", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "562882c4-5e1c-43a7-ae81-52d821ac595c",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "72c9cdff-2699-405f-abcb-1af7280e31a6", "type": "CDSView"}
                                    }, "id": "fe1543dc-764c-4ee1-b5fa-f7a27b1c05fa", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "a83fba5d-69ac-4635-9e7a-6cfe643bba0d",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "6b18b3db-90a9-4fed-bb75-51ebbb6054de", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["72.0", "71.8", "71.6", "71.4", "71.2", "71.1", "70.7", "70.5", "70.2", "70.2", "70.0", "70.0", "70.0", "69.8", "69.6", "69.6", "69.8", "69.6", "69.6", "69.6", "69.8", "69.8", "69.8", "69.8", "70.0", "69.8", "69.6", "69.6", "69.6", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.4", "69.6", "69.6", "69.8", "69.8", "70.0", "69.8", "69.8", "70.0", "70.0", "70.2", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.2", "70.0", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.4", "69.4", "69.6", "69.6", "69.6", "69.6", "69.4", "69.6", "69.6", "69.4", "69.4", "69.4", "69.4", "69.3", "69.3", "69.4", "69.6", "69.8", "70.0", "70.2", "70.0", "70.2", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.0", "70.2", "70.2", "70.2", "70.2", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.3", "70.2", "70.3", "70.3", "70.3", "70.3", "70.3", "70.2", "70.3", "70.2", "70.3", "70.7", "70.7", "70.3", "70.5", "70.3", "70.3", "70.5", "70.3", "70.3", "70.3", "70.3", "70.3", "70.2", "70.2", "70.2", "70.5", "70.5", "70.5", "70.7", "70.9", "71.2", "71.4", "71.8", "72.1", "72.3", "72.5", "72.7", "73.0", "73.0", "73.0", "73.2", "73.6", "73.4", "73.4", "73.4", "73.6", "73.8", "73.6", "73.9", "73.9", "73.9", "74.1", "74.1", "74.5", "74.7", "74.5", "74.3", "74.3", "74.8", "75.0", "75.0", "74.7", "74.7", "75.2", "75.2", "74.7", "74.5", "74.7", "75.0", "74.8", "74.8", "75.2", "75.0", "75.9", "75.4", "75.0", "75.4", "75.2", "75.0", "74.8", "75.0", "75.0", "75.2", "74.7", "75.4", "75.6", "75.6", "75.2", "74.8", "74.7", "74.3", "74.5", "74.5", "75.0", "74.8", "74.5", "74.5", "74.1", "74.1", "74.7", "74.1", "74.7", "74.1", "74.1", "74.1", "74.1", "74.3", "74.3", "74.3", "74.1", "74.1", "74.7", "74.5", "74.1", "74.5", "74.1", "74.5", "74.3", "74.3", "74.1", "73.8", "73.9"]
                                        }
                                    }, "id": "a83fba5d-69ac-4635-9e7a-6cfe643bba0d", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "e0b1c01d-7694-49f7-8a7a-a147e8bf9bce",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "61a7eb91-46fb-40b5-9044-7417b5e10b16", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "22d674ba-f05a-472d-8722-65267472cd65",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "84237814-0be1-4bd5-939a-d97919555280", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "080b5cbb-0b1c-4398-b148-e8fd4edd048f",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "435e8703-eb64-4a95-80c4-8e6f15c6e5a2", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "74a10097-ab1f-4c17-ab28-28d764d7693d",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "c04b5d20-c784-4520-9a44-65d9a4660170", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "5a942fe5-9822-4475-aee8-ce00e6d0a57f", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "684ab688-1815-416b-b6e9-f700937df8e3", "type": "Line"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["70.9", "70.9", "70.9", "70.7", "70.9", "70.9", "70.9", "71.1", "70.9", "70.7", "70.7", "70.7", "70.7", "71.1", "70.9", "70.5", "70.5", "70.9", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.9", "70.7", "70.5", "70.5", "70.5", "70.5", "70.5", "70.3", "70.3", "70.5", "70.5", "70.7", "70.7", "70.7", "70.9", "70.7", "70.7", "70.9", "70.7", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.7", "71.1", "70.9", "70.9", "70.9", "71.1", "70.9", "70.7", "70.9", "70.9", "70.9", "70.9", "70.9", "70.7", "70.7", "70.9", "70.9", "70.7", "70.9", "70.9", "70.7", "70.7", "70.7", "70.9", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.5", "70.7", "70.5", "70.5", "70.5", "70.5", "70.9", "70.9", "71.1", "71.2", "71.1", "71.1", "71.1", "71.1", "71.1", "71.2", "71.2", "71.2", "71.1", "71.2", "71.1", "71.2", "71.1", "71.1", "71.1", "71.1", "71.1", "71.2", "71.2", "71.1", "71.2", "71.2", "71.2", "71.2", "71.1", "71.1", "71.2", "71.2", "71.1", "71.4", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.1", "71.1", "71.1", "71.2", "71.4", "71.4", "71.2", "71.4", "71.2", "71.2", "71.2", "71.4", "71.2", "71.2", "71.6", "71.4", "71.4", "71.4", "71.6", "71.6", "71.8", "71.8", "71.8", "71.6", "71.6", "71.8", "71.8", "71.8", "72.0", "71.8", "71.8", "71.8", "71.8", "71.8", "72.0", "72.0", "72.1", "72.0", "72.1", "72.1", "72.0", "72.1", "72.1", "72.1", "72.1", "72.0", "72.0", "72.0", "72.0", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.1", "72.3", "72.3", "72.1", "72.1", "72.1", "72.1", "72.3", "72.3", "72.3", "72.3", "72.1", "72.0", "72.0", "71.8", "71.8", "72.1", "72.0", "72.0", "72.0", "72.0", "72.0", "71.8", "71.8", "72.0", "72.0", "72.0", "72.1", "72.1", "72.0", "72.0", "72.1", "72.1", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.3", "72.1", "72.3", "72.3", "72.3"]
                                        }
                                    }, "id": "0c113373-2e67-404d-b4bc-cea6ada82139", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {"plot": null, "text": "air_temperature"},
                                    "id": "95c4bf54-a14c-483e-8284-8b199f753dc9",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "0c113373-2e67-404d-b4bc-cea6ada82139",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "92f6a636-ff53-44ff-a1a9-7a2579deb558", "type": "CDSView"
                                }, {
                                    "attributes": {},
                                    "id": "735df74b-1281-4ca3-b437-fbc9937bbefe",
                                    "type": "HelpTool"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "8704eeb8-53ad-4aa2-8176-24342176d9f2", "type": "Line"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "2c975027-9907-4c8c-b8a1-c5aaddebd24c",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "84237814-0be1-4bd5-939a-d97919555280",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "8a6f0a56-3d9f-498b-b0c1-e281363bcc29",
                                            "type": "LegendItem"
                                        }, {"id": "414d9d5f-96c2-4a4b-9626-3f52abe23fd1", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "758f4e3b-fb08-4517-b497-7628047db8ea",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "cab2ffb3-54d6-498d-83d1-9aedaaec3eb7", "type": "Legend"
                                }, {
                                    "attributes": {},
                                    "id": "25f8c410-50ac-40f4-9fb0-b5c32fab3fd6",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "ab5e5b8b-fe34-423f-bcf7-844134338f01",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {},
                                    "id": "74a10097-ab1f-4c17-ab28-28d764d7693d",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "4f665613-8c72-4d8f-a0ab-f31e15cc1221", "type": "Line"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "845d429b-5da4-40e9-a588-c25835d99480",
                                    "type": "DatetimeTickFormatter"
                                }], "root_ids": ["758f4e3b-fb08-4517-b497-7628047db8ea"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "a153ec13-04cd-4123-931a-97973bc602aa",
                        "elementid": "1d6303c2-0d1d-41e3-a62f-d77740448d2c",
                        "modelid": "758f4e3b-fb08-4517-b497-7628047db8ea"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();

(function () {
    var fn = function () {
        Bokeh.safely(function () {
            (function (root) {
                function embed_document(root) {
                    var docs_json = {
                        "f818d724-280c-4150-9c8c-ce69890e41e7": {
                            "roots": {
                                "references": [{
                                    "attributes": {},
                                    "id": "404f3a58-a36d-4838-9037-29f9eed368b8",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "label": {"value": "lexington"},
                                        "renderers": [{
                                            "id": "ae2e546a-34d3-4cb7-b93a-74729768d88b",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "412edb70-06c7-4f05-ae1e-c9c0dae26144", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "70.9", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.4", "71.4", "71.4", "71.4", "71.4", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.8", "71.8", "71.8", "71.8", "71.8"]
                                        }
                                    }, "id": "b115d47e-57c1-4fdf-b2e2-d702ef7a73e4", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {"plot": null, "text": "water_temperature"},
                                    "id": "9cdb6ce8-9d77-4bc0-b13c-1fa7500fcc4e",
                                    "type": "Title"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "77f940ba-ddab-4ccd-b0d8-33ad7109cd9b", "type": "Line"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "a7cb9344-7859-45d4-90ea-9f0e45f65e67",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "77f940ba-ddab-4ccd-b0d8-33ad7109cd9b", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "926dbf84-d70c-4e5b-9752-68380a4638c7",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "7f99c03a-e283-4e6d-a67c-2dec0899e303", "type": "CDSView"}
                                    }, "id": "ae2e546a-34d3-4cb7-b93a-74729768d88b", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "6c65f948-1f94-48ba-bb39-742cf8360ade",
                                    "type": "BasicTickFormatter"
                                }, {
                                    "attributes": {
                                        "below": [{
                                            "id": "a5c4f9c2-69e9-4932-9f42-b7cac74b5189",
                                            "type": "LinearAxis"
                                        }],
                                        "left": [{
                                            "id": "d02f6a24-dc8d-47e9-9f88-dd79dfe0b1e6",
                                            "type": "LinearAxis"
                                        }],
                                        "plot_height": 485,
                                        "plot_width": 729,
                                        "renderers": [{
                                            "id": "a5c4f9c2-69e9-4932-9f42-b7cac74b5189",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "d28c5dbf-7e7d-4c32-98c7-e810b7ba9afa",
                                            "type": "Grid"
                                        }, {
                                            "id": "d02f6a24-dc8d-47e9-9f88-dd79dfe0b1e6",
                                            "type": "LinearAxis"
                                        }, {
                                            "id": "203e4590-86f9-428d-8319-04dab2be5875",
                                            "type": "Grid"
                                        }, {
                                            "id": "733f0af9-d681-4cdf-96ed-df39a1453412",
                                            "type": "BoxAnnotation"
                                        }, {
                                            "id": "7ad5ae04-c1db-474a-b359-7c8c314ed827",
                                            "type": "Legend"
                                        }, {
                                            "id": "a4654006-882f-4018-aa64-f0d998a47da1",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "4806261a-2c18-4afa-8ac3-4ca226d2ea0e",
                                            "type": "GlyphRenderer"
                                        }, {
                                            "id": "ae2e546a-34d3-4cb7-b93a-74729768d88b",
                                            "type": "GlyphRenderer"
                                        }, {"id": "23549c0a-6fd5-4eca-a009-41e836de0719", "type": "GlyphRenderer"}],
                                        "title": {"id": "9cdb6ce8-9d77-4bc0-b13c-1fa7500fcc4e", "type": "Title"},
                                        "toolbar": {
                                            "id": "e7445d92-d1a8-4a4c-9cb5-0ce4c5c211ff",
                                            "type": "Toolbar"
                                        },
                                        "x_range": {
                                            "id": "13ef2956-d9bd-47e7-aef3-1663f8d05b13",
                                            "type": "DataRange1d"
                                        },
                                        "x_scale": {
                                            "id": "e205e31f-b040-46b8-b28e-14dd41d9941f",
                                            "type": "LinearScale"
                                        },
                                        "y_range": {
                                            "id": "3bc0abcc-360d-4849-b853-14eebde6f665",
                                            "type": "DataRange1d"
                                        },
                                        "y_scale": {
                                            "id": "2a48d9e4-3103-4d63-b571-7ce8f81b77a8",
                                            "type": "LinearScale"
                                        }
                                    },
                                    "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                    "subtype": "Figure",
                                    "type": "Plot"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "13ef2956-d9bd-47e7-aef3-1663f8d05b13",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "fd576ebd-c437-4987-bb2e-3c444f7ef26d",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "a2418cf2-0526-4b57-80d9-9ea65154ded1", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "label": {"value": "port_aransas"},
                                        "renderers": [{
                                            "id": "a4654006-882f-4018-aa64-f0d998a47da1",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "72d375c8-dfe8-4d09-a109-4ffac9c3acd7", "type": "LegendItem"
                                }, {
                                    "attributes": {
                                        "axis_label": "Height (ft.)",
                                        "formatter": {
                                            "id": "6c65f948-1f94-48ba-bb39-742cf8360ade",
                                            "type": "BasicTickFormatter"
                                        },
                                        "plot": {
                                            "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "404f3a58-a36d-4838-9037-29f9eed368b8",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "d02f6a24-dc8d-47e9-9f88-dd79dfe0b1e6", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "c8b2cd46-f9c7-4180-9f1f-828288d2f792", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "4b573568-e059-46fe-b2c7-67d873f73f3d", "type": "Line"
                                }, {
                                    "attributes": {"callback": null},
                                    "id": "3bc0abcc-360d-4849-b853-14eebde6f665",
                                    "type": "DataRange1d"
                                }, {
                                    "attributes": {},
                                    "id": "21f61d0c-d0c3-4d2d-98e6-3784e39397b5",
                                    "type": "WheelZoomTool"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "0f563f55-7091-4982-bcd5-768eb9a436a7", "type": "Line"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "2c99e65b-1209-4827-81dc-9c4f6693bee2", "type": "Line"
                                }, {
                                    "attributes": {
                                        "active_drag": "auto",
                                        "active_inspect": "auto",
                                        "active_scroll": "auto",
                                        "active_tap": "auto",
                                        "tools": [{
                                            "id": "157ebaec-0c86-4224-b4cc-06c22f0fc176",
                                            "type": "PanTool"
                                        }, {
                                            "id": "21f61d0c-d0c3-4d2d-98e6-3784e39397b5",
                                            "type": "WheelZoomTool"
                                        }, {
                                            "id": "4b613fe2-f031-48ac-a5e4-b8cb01cf3ce7",
                                            "type": "BoxZoomTool"
                                        }, {
                                            "id": "f8f5310c-7bbf-43df-a489-b9674366962a",
                                            "type": "SaveTool"
                                        }, {
                                            "id": "bacb4b00-89bd-49cf-9977-e508341f78b5",
                                            "type": "ResetTool"
                                        }, {"id": "77a68186-f00e-43d6-9470-a0046e34576b", "type": "HelpTool"}]
                                    }, "id": "e7445d92-d1a8-4a4c-9cb5-0ce4c5c211ff", "type": "Toolbar"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "727bc25c-02e5-4f3d-93f7-f89a390cf2ef",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "c0bd6ac5-c222-43cc-bc15-ab7678289d29", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "axis_label": "Time",
                                        "formatter": {
                                            "id": "2e055c33-c2f3-43c2-b402-32ec51533aec",
                                            "type": "DatetimeTickFormatter"
                                        },
                                        "plot": {
                                            "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "35c9e1f0-297b-4160-bd1e-f39a1eae5a71",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "a5c4f9c2-69e9-4932-9f42-b7cac74b5189", "type": "LinearAxis"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0],
                                            "y": ["69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "70.0", "70.2", "70.3", "70.3", "70.5", "70.5", "70.5", "70.5", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.9", "70.9", "70.9", "70.9", "71.1", "71.1", "71.1", "70.9", "70.9", "70.9", "71.1", "70.9", "70.9", "70.7", "70.7", "70.9", "71.1", "70.9", "70.9", "70.7", "71.1", "70.9", "70.9", "70.9", "70.5", "70.5", "70.7", "70.7", "70.5", "70.9", "70.7", "70.5", "70.3", "70.5", "70.9", "70.7", "70.7", "70.7", "70.9", "70.9", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.3", "70.3", "70.3", "70.3", "70.3", "70.5", "70.5", "70.5", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.5", "70.3", "70.5", "70.5", "70.5", "70.7", "70.7", "70.7", "70.7", "70.5", "70.5", "70.5", "70.5", "70.5", "70.7", "70.7", "70.5", "70.5", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.5", "70.5", "70.7", "70.9", "70.7", "70.9", "70.9", "70.9", "70.7", "70.9", "70.7", "70.9", "70.7", "70.9", "71.1", "71.1", "71.1", "71.1", "71.2", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1"]
                                        }
                                    }, "id": "fd576ebd-c437-4987-bb2e-3c444f7ef26d", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {},
                                    "id": "bacb4b00-89bd-49cf-9977-e508341f78b5",
                                    "type": "ResetTool"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "926dbf84-d70c-4e5b-9752-68380a4638c7", "type": "Line"
                                }, {
                                    "attributes": {},
                                    "id": "157ebaec-0c86-4224-b4cc-06c22f0fc176",
                                    "type": "PanTool"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "a7cb9344-7859-45d4-90ea-9f0e45f65e67",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "7f99c03a-e283-4e6d-a67c-2dec0899e303", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "fd576ebd-c437-4987-bb2e-3c444f7ef26d",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "9acbb965-d45b-4d75-8f98-ba9c6ddd7e73", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "59d08be9-716b-4c81-8a05-8b2945f0edfb",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "a2418cf2-0526-4b57-80d9-9ea65154ded1", "type": "CDSView"}
                                    }, "id": "23549c0a-6fd5-4eca-a009-41e836de0719", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "727bc25c-02e5-4f3d-93f7-f89a390cf2ef",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "0f563f55-7091-4982-bcd5-768eb9a436a7", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "c8b2cd46-f9c7-4180-9f1f-828288d2f792",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "c0bd6ac5-c222-43cc-bc15-ab7678289d29", "type": "CDSView"}
                                    }, "id": "a4654006-882f-4018-aa64-f0d998a47da1", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {},
                                    "id": "35c9e1f0-297b-4160-bd1e-f39a1eae5a71",
                                    "type": "BasicTicker"
                                }, {
                                    "attributes": {
                                        "overlay": {
                                            "id": "733f0af9-d681-4cdf-96ed-df39a1453412",
                                            "type": "BoxAnnotation"
                                        }
                                    }, "id": "4b613fe2-f031-48ac-a5e4-b8cb01cf3ce7", "type": "BoxZoomTool"
                                }, {
                                    "attributes": {
                                        "source": {
                                            "id": "b115d47e-57c1-4fdf-b2e2-d702ef7a73e4",
                                            "type": "ColumnDataSource"
                                        }
                                    }, "id": "98bfcf0a-f3b5-4faa-93be-c07961f0096a", "type": "CDSView"
                                }, {
                                    "attributes": {
                                        "data_source": {
                                            "id": "b115d47e-57c1-4fdf-b2e2-d702ef7a73e4",
                                            "type": "ColumnDataSource"
                                        },
                                        "glyph": {"id": "4b573568-e059-46fe-b2c7-67d873f73f3d", "type": "Line"},
                                        "hover_glyph": null,
                                        "muted_glyph": null,
                                        "nonselection_glyph": {
                                            "id": "2c99e65b-1209-4827-81dc-9c4f6693bee2",
                                            "type": "Line"
                                        },
                                        "selection_glyph": null,
                                        "view": {"id": "98bfcf0a-f3b5-4faa-93be-c07961f0096a", "type": "CDSView"}
                                    }, "id": "4806261a-2c18-4afa-8ac3-4ca226d2ea0e", "type": "GlyphRenderer"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["70.3", "70.3", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5"]
                                        }
                                    }, "id": "727bc25c-02e5-4f3d-93f7-f89a390cf2ef", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "9acbb965-d45b-4d75-8f98-ba9c6ddd7e73", "type": "Line"
                                }, {
                                    "attributes": {
                                        "label": {"value": "aransas_pass"},
                                        "renderers": [{
                                            "id": "23549c0a-6fd5-4eca-a009-41e836de0719",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "f6cddd31-e151-4dc1-b48f-a73486cd2792", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "e205e31f-b040-46b8-b28e-14dd41d9941f",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {},
                                    "id": "77a68186-f00e-43d6-9470-a0046e34576b",
                                    "type": "HelpTool"
                                }, {
                                    "attributes": {
                                        "callback": null,
                                        "column_names": ["y", "x"],
                                        "data": {
                                            "x": [1511801280000.0, 1511801640000.0, 1511802000000.0, 1511802360000.0, 1511802720000.0, 1511803080000.0, 1511803440000.0, 1511803800000.0, 1511804160000.0, 1511804520000.0, 1511804880000.0, 1511805240000.0, 1511805600000.0, 1511805960000.0, 1511806320000.0, 1511806680000.0, 1511807040000.0, 1511807400000.0, 1511807760000.0, 1511808120000.0, 1511808480000.0, 1511808840000.0, 1511809200000.0, 1511809560000.0, 1511809920000.0, 1511810280000.0, 1511810640000.0, 1511811000000.0, 1511811360000.0, 1511811720000.0, 1511812080000.0, 1511812440000.0, 1511812800000.0, 1511813160000.0, 1511813520000.0, 1511813880000.0, 1511814240000.0, 1511814600000.0, 1511814960000.0, 1511815320000.0, 1511815680000.0, 1511816040000.0, 1511816400000.0, 1511816760000.0, 1511817120000.0, 1511817480000.0, 1511817840000.0, 1511818200000.0, 1511818560000.0, 1511818920000.0, 1511819280000.0, 1511819640000.0, 1511820000000.0, 1511820360000.0, 1511820720000.0, 1511821080000.0, 1511821440000.0, 1511821800000.0, 1511822160000.0, 1511822520000.0, 1511822880000.0, 1511823240000.0, 1511823600000.0, 1511823960000.0, 1511824320000.0, 1511824680000.0, 1511825040000.0, 1511825400000.0, 1511825760000.0, 1511826120000.0, 1511826480000.0, 1511826840000.0, 1511827200000.0, 1511827560000.0, 1511827920000.0, 1511828280000.0, 1511828640000.0, 1511829000000.0, 1511829360000.0, 1511829720000.0, 1511830080000.0, 1511830440000.0, 1511830800000.0, 1511831160000.0, 1511831520000.0, 1511831880000.0, 1511832240000.0, 1511832600000.0, 1511832960000.0, 1511833320000.0, 1511833680000.0, 1511834040000.0, 1511834400000.0, 1511834760000.0, 1511835120000.0, 1511835480000.0, 1511835840000.0, 1511836200000.0, 1511836560000.0, 1511836920000.0, 1511837280000.0, 1511837640000.0, 1511838000000.0, 1511838360000.0, 1511838720000.0, 1511839080000.0, 1511839440000.0, 1511839800000.0, 1511840160000.0, 1511840520000.0, 1511840880000.0, 1511841240000.0, 1511841600000.0, 1511841960000.0, 1511842320000.0, 1511842680000.0, 1511843040000.0, 1511843400000.0, 1511843760000.0, 1511844120000.0, 1511844480000.0, 1511844840000.0, 1511845200000.0, 1511845560000.0, 1511845920000.0, 1511846280000.0, 1511846640000.0, 1511847000000.0, 1511847360000.0, 1511847720000.0, 1511848080000.0, 1511848440000.0, 1511848800000.0, 1511849160000.0, 1511849520000.0, 1511849880000.0, 1511850240000.0, 1511850600000.0, 1511850960000.0, 1511851320000.0, 1511851680000.0, 1511852040000.0, 1511852400000.0, 1511852760000.0, 1511853120000.0, 1511853480000.0, 1511853840000.0, 1511854200000.0, 1511854560000.0, 1511854920000.0, 1511855280000.0, 1511855640000.0, 1511856000000.0, 1511856360000.0, 1511856720000.0, 1511857080000.0, 1511857440000.0, 1511857800000.0, 1511858160000.0, 1511858520000.0, 1511858880000.0, 1511859240000.0, 1511859600000.0, 1511859960000.0, 1511860320000.0, 1511860680000.0, 1511861040000.0, 1511861400000.0, 1511861760000.0, 1511862120000.0, 1511862480000.0, 1511862840000.0, 1511863200000.0, 1511863560000.0, 1511863920000.0, 1511864280000.0, 1511864640000.0, 1511865000000.0, 1511865360000.0, 1511865720000.0, 1511866080000.0, 1511866440000.0, 1511866800000.0, 1511867160000.0, 1511867520000.0, 1511867880000.0, 1511868240000.0, 1511868600000.0, 1511868960000.0, 1511869320000.0, 1511869680000.0, 1511870040000.0, 1511870400000.0, 1511870760000.0, 1511871120000.0, 1511871480000.0, 1511871840000.0, 1511872200000.0, 1511872560000.0, 1511872920000.0, 1511873280000.0, 1511873640000.0, 1511874000000.0, 1511874360000.0, 1511874720000.0, 1511875080000.0, 1511875440000.0, 1511875800000.0, 1511876160000.0, 1511876520000.0, 1511876880000.0, 1511877240000.0, 1511877600000.0, 1511877960000.0, 1511878320000.0, 1511878680000.0, 1511879040000.0, 1511879400000.0, 1511879760000.0, 1511880120000.0, 1511880480000.0, 1511880840000.0, 1511881200000.0, 1511881560000.0, 1511881920000.0, 1511882280000.0, 1511882640000.0, 1511883000000.0, 1511883360000.0, 1511883720000.0, 1511884080000.0, 1511884440000.0, 1511884800000.0, 1511885160000.0, 1511885520000.0, 1511885880000.0, 1511886240000.0, 1511886600000.0, 1511886960000.0],
                                            "y": ["71.6", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "72.0", "72.0", "72.0", "72.0", "72.0", "72.0", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.8", "71.6", "71.6", "71.6", "71.6", "71.6", "71.6", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.4", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.2", "71.1", "71.1", "71.1", "71.1", "71.1", "71.1", "70.9", "70.9", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.7", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.2", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "70.0", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.8", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.6", "69.8", "70.0", "70.0", "70.0", "70.2", "70.2", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.3", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.5", "70.7"]
                                        }
                                    }, "id": "a7cb9344-7859-45d4-90ea-9f0e45f65e67", "type": "ColumnDataSource"
                                }, {
                                    "attributes": {
                                        "dimension": 1,
                                        "plot": {
                                            "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "404f3a58-a36d-4838-9037-29f9eed368b8",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "203e4590-86f9-428d-8319-04dab2be5875", "type": "Grid"
                                }, {
                                    "attributes": {
                                        "label": {"value": "bob_hall_pier"},
                                        "renderers": [{
                                            "id": "4806261a-2c18-4afa-8ac3-4ca226d2ea0e",
                                            "type": "GlyphRenderer"
                                        }]
                                    }, "id": "601ee5d8-34cf-4d93-b3ab-4e4edab649e9", "type": "LegendItem"
                                }, {
                                    "attributes": {},
                                    "id": "2a48d9e4-3103-4d63-b571-7ce8f81b77a8",
                                    "type": "LinearScale"
                                }, {
                                    "attributes": {},
                                    "id": "f8f5310c-7bbf-43df-a489-b9674366962a",
                                    "type": "SaveTool"
                                }, {
                                    "attributes": {"days": ["%a, %r"], "hours": ["%a, %r"], "minutes": ["%a, %r"]},
                                    "id": "2e055c33-c2f3-43c2-b402-32ec51533aec",
                                    "type": "DatetimeTickFormatter"
                                }, {
                                    "attributes": {
                                        "line_alpha": {"value": 0.1},
                                        "line_color": {"value": "#1f77b4"},
                                        "line_width": {"value": 2},
                                        "x": {"field": "x"},
                                        "y": {"field": "y"}
                                    }, "id": "59d08be9-716b-4c81-8a05-8b2945f0edfb", "type": "Line"
                                }, {
                                    "attributes": {
                                        "bottom_units": "screen",
                                        "fill_alpha": {"value": 0.5},
                                        "fill_color": {"value": "lightgrey"},
                                        "left_units": "screen",
                                        "level": "overlay",
                                        "line_alpha": {"value": 1.0},
                                        "line_color": {"value": "black"},
                                        "line_dash": [4, 4],
                                        "line_width": {"value": 2},
                                        "plot": null,
                                        "render_mode": "css",
                                        "right_units": "screen",
                                        "top_units": "screen"
                                    }, "id": "733f0af9-d681-4cdf-96ed-df39a1453412", "type": "BoxAnnotation"
                                }, {
                                    "attributes": {
                                        "items": [{
                                            "id": "72d375c8-dfe8-4d09-a109-4ffac9c3acd7",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "601ee5d8-34cf-4d93-b3ab-4e4edab649e9",
                                            "type": "LegendItem"
                                        }, {
                                            "id": "412edb70-06c7-4f05-ae1e-c9c0dae26144",
                                            "type": "LegendItem"
                                        }, {"id": "f6cddd31-e151-4dc1-b48f-a73486cd2792", "type": "LegendItem"}],
                                        "plot": {
                                            "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        }
                                    }, "id": "7ad5ae04-c1db-474a-b359-7c8c314ed827", "type": "Legend"
                                }, {
                                    "attributes": {
                                        "plot": {
                                            "id": "598a4537-b84f-4fdc-ba46-1423d7a3507a",
                                            "subtype": "Figure",
                                            "type": "Plot"
                                        },
                                        "ticker": {
                                            "id": "35c9e1f0-297b-4160-bd1e-f39a1eae5a71",
                                            "type": "BasicTicker"
                                        }
                                    }, "id": "d28c5dbf-7e7d-4c32-98c7-e810b7ba9afa", "type": "Grid"
                                }], "root_ids": ["598a4537-b84f-4fdc-ba46-1423d7a3507a"]
                            }, "title": "Bokeh Application", "version": "0.12.10"
                        }
                    };
                    var render_items = [{
                        "docid": "f818d724-280c-4150-9c8c-ce69890e41e7",
                        "elementid": "d52c245c-1152-4a94-87d2-ec6626e28e1c",
                        "modelid": "598a4537-b84f-4fdc-ba46-1423d7a3507a"
                    }];

                    root.Bokeh.embed.embed_items(docs_json, render_items);
                }

                if (root.Bokeh !== undefined) {
                    embed_document(root);
                } else {
                    var attempts = 0;
                    var timer = setInterval(function (root) {
                        if (root.Bokeh !== undefined) {
                            embed_document(root);
                            clearInterval(timer);
                        }
                        attempts++;
                        if (attempts > 100) {
                            console.log("Bokeh: ERROR: Unable to embed document because BokehJS library is missing")
                            clearInterval(timer);
                        }
                    }, 10, root)
                }
            })(window);
        });
    };
    if (document.readyState != "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
})();
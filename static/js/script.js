/**
 * Initialize and display Google maps
 */

var initial_lat = 27.75875;            //  The corresponding latitude of map center at initialization.
var initial_lng = -97.245233;          //  The corresponding longitude of map center at initialization.
var initial_zoom = 11;                 //  The corresponding zoom of map center at initialization.
var map;


function initMap() {
    var latlng = {lat: initial_lat, lng: initial_lng};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: initial_zoom,
        center: latlng,
        mapTypeId: 'roadmap'
    });

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: 'Corpus Christi Bay'
    });
}



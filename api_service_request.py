from getkey import search_key
from api_service import api_data_request
import time

"""
    Source: https://www.marinetraffic.com/en/ais-api-services/documentation
    [PS06]	Vessel Positions in a Custom Area
    Typical API call:
        http://services.marinetraffic.com/api/exportvessels/v:8/YOUR-API-KEY/MINLAT:value/MAXLAT:value/
        MINLON:value/MAXLON:value/timespan:#minutes/protocol:value

Example API call:
http://services.marinetraffic.com/api/exportvessels/v:8/8205c862d0572op1655989d939f1496c092ksvs4/MINLAT:38.20882/MAXLAT:40.24562/MINLON:-6.7749/MAXLON:-4.13721/timespan:10/protocol:json

    Simplified JSON sample response [simple]:
        [["304010417","9015462","359396","47.758499","-5.154223","74","329","327","0","2017-05-19T09:39:57","TER","54"],
        ["215819000","9034731","150559","47.926899","-5.531450","122","162","157","0","2017-05-19T09:44:27","TER","28"],
        ["255925000","9184433","300518","47.942631","-5.116510","79","316","311","0","2017-05-19T09:43:53","TER","52"]]
#   This function will retrieve JSON object using Marine Traffic API service
"""


def marine_traffic_request():
    mt_json_file = 'marine_traffic.json'
    api_key = search_key(api_name="marine")
    min_lat = 27.6289
    max_lat = 27.92295
    min_lon = -97.52313
    max_lon = -96.99029
    timespan = 20;
    protocol = "json"
    marine_traffic_api_url = ("http://services.marinetraffic.com/api/exportvessels/v:8/" + str(api_key) + "/MINLAT:" +
                              str(min_lat) + "/MAXLAT:" + str(max_lat) + "/MINLON:" + str(min_lon) + "/MAXLON:" +
                              str(max_lon) + "/timespan:" + str(timespan) + "/protocol:" + protocol)
    #print marine_traffic_api_url

    #   Call the API service for JSON data
    mt_data = api_data_request(api_url=marine_traffic_api_url, json_file=mt_json_file)
    #    print mt_data


"""
    This function requests weather data by city ID
    Source: https://openweathermap.org/history#geo
    Example API call: http://samples.openweathermap.org/data/2.5/history/city?q=Corpus%20Christi,US&appid=b1b15e88fa797225412429c1c50c122a1
    
      {
    "id": 4683416,
    "name": "Corpus Christi",
    "country": "US",
    "coord": {
      "lon": -97.396378,
      "lat": 27.800579
    }
    
"""


def open_weather_request():
    # Using type will overshadow in-built "type"
    ow_json_file = "open_weather.json"
    city_id = 4683416
    unit = "imperial"
    count = 10
    api_key = search_key(api_name="weather")
    print api_key
    open_weather_url = ("http://api.openweathermap.org/data/2.5/forecast/?id=" + str(city_id) +
                        "&units=" + unit + "&cnt=" + str(count) + "&appid=" + api_key)
    api_data_request(api_url=open_weather_url, json_file=ow_json_file)


open_weather_request()
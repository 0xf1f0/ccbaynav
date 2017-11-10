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
"""
import requests
from getkey import search_key


#   This function will retrieve JSON object using Marine Traffic API
#   See http://nominatim.openstreetmap.org for
#   viewbox: -97.62520, 28.01441, -96.86852, 27.71089

def marine_traffic_json():
    api_key = search_key(api_name="marine")
    min_lat = 27.71089
    max_lat = 28.01441
    min_lon = -96.86852
    max_lon = -97.62520
    timespan = 10
    protocol = "json"
    api_response = requests.get("http://services.marinetraffic.com/api/exportvessels/v:8/" +
                               str(api_key) +
                               "/MINLAT:" + str(min_lat) +
                               "/MAXLAT:" + str(max_lat) +
                               "/MINLON:" + str(min_lon) +
                               "/MAXLON:" + str(max_lon) +
                               "/timespan:" + str(timespan) +
                               "/protocol:" + str(protocol)
                               )
    #   Check HTTP status code of api_request to be OK
    #   Store response in a dictionary (for now)
    if api_response.status_code == 200:
        marine_data = api_response.json()
        print marine_data
    else:
        print api_response.status_code


marine_traffic_json()

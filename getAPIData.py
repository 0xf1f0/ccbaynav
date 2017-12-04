import json
import shutil

import requests

from getAPIKey import search_key

"""
    Source: https://www.marinetraffic.com/en/ais-api-services/documentation
    [PS06]	Vessel Positions in a Custom Area
    Typical API call:
        http://services.marinetraffic.com/api/exportvessels/v:8/YOUR-API-KEY/MINLAT:value/MAXLAT:value/
        MINLON:value/MAXLON:value/timespan:#minutes/protocol:value

"""


def marine_traffic_request():
    mt_json_file = 'static/api/marine_traffic.json'
    api_key = search_key(api_name="marine")
    min_lat = 27.6289
    max_lat = 27.92295
    min_lon = -97.52313
    max_lon = -96.99029
    protocol = "jsono"
    msg_type = "extended"

    # API call for : Vessel Positions in a custom area
    marine_traffic_api_url = ("http://services.marinetraffic.com/api/exportvessels/v:8/" + str(api_key) + "/MINLAT:" +
                              str(min_lat) + "/MAXLAT:" + str(max_lat) + "/MINLON:" + str(min_lon) + "/MAXLON:" +
                              str(max_lon) + "/msgtype:" + msg_type + "/protocol:" + protocol)

    # API call for : Vessel Positions in a predefined area
    # marine_traffic_api_url = ("http://services.marinetraffic.com/api/exportvessels/v:8/" + str(api_key) +
    #                           "/msgtype:" + msg_type + "/protocol:" + protocol)

    #   print marine_traffic_api_url

    #   Call the API service for JSON data and store the response in a file
    mt_data = api_data_request(api_url=marine_traffic_api_url, json_file=mt_json_file)
    if mt_data is not None:
        print "Code: 200"
    else:
        print "Code: 404"


# function to capture data for a specified station from noaa
def noaa_request_maker(loc_id, variable, file_name, data):
    noaa_base_url = 'https://tidesandcurrents.noaa.gov/api/datagetter?range=24&datum=MLLW&units=english&time_zone=lst&application=ccbaynav&format=json'
    request_url = noaa_base_url + '&station=' + loc_id + '&product=' + variable
    data_request = requests.get(request_url)
    temp_data = data_request.json()
    if 'error' in temp_data:
        print loc_id, variable, "error"

    # read in all the different wind values
    elif variable is 'wind':
        data['wind_speed'][file_name] = {}
        data['wind_direction'][file_name] = {}
        data['wind_gust'][file_name] = {}
        for x in range(0, len(temp_data['data'])):
            time = temp_data['data'][x]['t']
            data['wind_speed'][file_name][time] = temp_data['data'][x]['s']
            data['wind_direction'][file_name][time] = temp_data['data'][x]['d']
            data['wind_gust'][file_name][time] = temp_data['data'][x]['g']
    # read in all the other values (not wind)
    else:
        data[variable][file_name] = {}
        for x in range(0, len(temp_data['data'])):
            time = temp_data['data'][x]['t']
            data[variable][file_name][time] = temp_data['data'][x]['v']


# function to query NOAA in a loop for all the wanted stations and variables
def get_noaa_data():
    locations = {"lexington": "8775296", "port_aransas": "8775237", "aransas_pass": "8775241",
                 "bob_hall_pier": "8775870"}
    var_list = ['wind', 'water_level', 'air_temperature', 'water_temperature']
    end_var_list = ['wind_gust', 'wind_direction', 'wind_speed', 'water_level', 'air_temperature', 'water_temperature']
    data = {}

    for var in end_var_list:
        data[var] = {}
    for (loc, loc_id) in locations.items():
        print loc
        for var in var_list:
            noaa_request_maker(loc_id, var, loc, data)

    # loop through data array and save noaa data with a separate file for each variable
    for var in end_var_list:
        with open('static/api/prog_' + var + '.json', 'w') as f:
            json.dump(data[var], f, sort_keys=True)

        # TODO - os.rename does not work on Windows delete one of these
        # os.rename('static/api/prog_' + var + '.json', 'static/api/' + var + '.json')
        shutil.move('static/api/prog_' + var + '.json', 'static/api/' + var + '.json')


"""
    This function returns JSON object for API service request
    Check HTTP status code of api_request to be OK
    Store response in a dictionary
    Write the JSON object to file
"""


def api_data_request(api_url, json_file):
    api_response = requests.get(api_url)
    if api_response.status_code == 200:
        try:
            with open(json_file, 'w') as f:
                f.write(api_response.content)
        except IOError as e:
            print e.message
    return api_response.status_code


# marine_traffic_request()
get_noaa_data()

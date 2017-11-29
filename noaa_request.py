import json

import requests


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
        with open('static/api/' + var + '.json', 'w') as f:
            json.dump(data[var], f, sort_keys=True)


get_noaa_data()
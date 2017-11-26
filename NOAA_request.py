import json, requests


def noaa_request_maker(location, variable, file_name, data):
    noaa_base_url = 'https://tidesandcurrents.noaa.gov/api/datagetter?range=24&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json'
    request_url = noaa_base_url + '&station=' + location + '&product=' + variable
    data_request = requests.get(request_url)
    temp_data = data_request.json()
    if 'error' in temp_data:
        print location, variable, "error"

    elif variable is 'wind':
        print 'wind'
        data['wind_speed'] = {}
        data['wind_direction'] = {}
        data['wind_gust'] = {}
        for x in range(0, len(temp_data['data'])):
            time = temp_data['data'][x]['t']
            data['wind_speed'][time] = temp_data['data'][x]['s']
            data['wind_direction'][time] = temp_data['data'][x]['d']
            data['wind_gust'][time] = temp_data['data'][x]['g']
    else:
        print variable
        data[variable] = {}
        for x in range(0, len(temp_data['data'])):
            time = temp_data['data'][x]['t']
            data[variable][time] = temp_data['data'][x]['v']


def get_noaa_data():
    locations = {"lexington": "8775296", "port_aransas": "8775237", "aransas_pass": "8775241",
                 "bob_hall_pier": "8775870"}
    var_list = ['wind', 'water_level', 'air_temperature', 'water_temperature']
    for (key, value) in locations.items():
        data = {}
        print key
        for var in var_list:
            # data [key] = {}
            noaa_request_maker(value, var, key, data)
        with open(key + '.json', 'w') as f:
            json.dump(data, f)


get_noaa_data()

# wind t s d g time speed direction gust
# water level t v s time verified sigma
# air and water temp t v time value


# print data['data'][0]['v']

# https://tidesandcurrents.noaa.gov/api/datagetter?range=3&station=8454000&product=water_level&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json

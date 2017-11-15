import json, requests

#This is the request for the Water Levels
Water_Levels = requests.get('https://tidesandcurrents.noaa.gov/api/datagetter?range=3&station=8775241&product=water_level&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json')
data = Water_Levels.json()
with open('Water_Levels.json', 'w') as f:
    json.dump(data, f)

#This is the request for the Water Temperature
Water_Temperature = requests.get('https://tidesandcurrents.noaa.gov/api/datagetter?range=3&station=8775241&product=water_temperature&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json')
data2 = Water_Temperature.json()
with open('Water_Temp.json', 'w') as f:
    json.dump(data2, f)

# This is the request for the Wind
Wind = requests.get(
    'https://tidesandcurrents.noaa.gov/api/datagetter?range=3&station=8775241&product=wind&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json')
data3 = Wind.json()
with open('Wind.json', 'w') as f:
    json.dump(data3, f)

# This is the request for the Air Temperature
air_temperature = requests.get('https://tidesandcurrents.noaa.gov/api/datagetter?range=3&station=8775241&product=air_temperature&datum=STND&units=english&time_zone=lst&application=ccbaynav&format=json')
data4 = air_temperature.json()
with open('air_temp.json', 'w') as f:
    json.dump(data4, f)


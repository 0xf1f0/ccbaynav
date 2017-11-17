#
# Import the weather icons from the json file and display the correct icon for current weather condition
# https://www.youtube.com/watch?v=pTT7HMqDnJw "JSON in Python" by: Socratica
#
# WHAT'S HAPPENING
# - import the icon.json with the open function and store in json_file
# - convert the file into a readable json dictionary (jIcons)
# - close the file opened earlier
# - convert the json diction into a string dictionary that can be read in python (pIcons)
# - getWeatherIcon function:
#     - take the icon_key as a parameter to search through the dictionary for the
#       corresponding icon image
#     - check to see if icon_key is empty
#         - if empty; inform user
#         - if not empty; check to see if the parameter matches a json key name
#             - if no match; inform the user
#             - if there is a match
#                   - set icon_img to the corresponding json key name
#                   - return icon_img


import json

json_file = open("icon.json", "r")
jIcons = json.load(json_file)
json_file.close()

pIcons = json.dumps(jIcons)


def get_weather_icon(icon_key):
    if icon_key:
        if icon_key == '01d':
            icon_img = pIcons["01d"]
            return icon_img
        elif icon_key == '01n':
            icon_img = pIcons["01n"]
            return icon_img
        elif icon_key == '02d':
            icon_img = pIcons["02d"]
            return icon_img
        elif icon_key == '02n':
            icon_img = pIcons["02n"]
            return icon_img
        elif icon_key == '03d':
            icon_img = pIcons["03d"]
            return icon_img
        elif icon_key == '03n':
            icon_img = pIcons["03n"]
            return icon_img
        elif icon_key == '04d':
            icon_img = pIcons["04d"]
            return icon_img
        elif icon_key == '04n':
            icon_img = pIcons["04n"]
            return icon_img
        elif icon_key == '09d':
            icon_img = pIcons["09d"]
            return icon_img
        elif icon_key == '09n':
            icon_img = pIcons["09n"]
            return icon_img
        elif icon_key == '10d':
            icon_img = pIcons["10d"]
            return icon_img
        elif icon_key == '10n':
            icon_img = pIcons["10n"]
            return icon_img
        elif icon_key == '11d':
            icon_img = pIcons["11d"]
            return icon_img
        elif icon_key == '11n':
            icon_img = pIcons["11n"]
            return icon_img
        elif icon_key == '13d':
            icon_img = pIcons["13d"]
            return icon_img
        elif icon_key == '13n':
            icon_img = pIcons["13n"]
            return icon_img
        elif icon_key == '50d':
            icon_img = pIcons["50d"]
            return icon_img
        elif icon_key == '50n':
            icon_img = pIcons["50n"]
            return icon_img
        else:
            print("That's not a valid icon key\n")
            return None
    else:
        print("icon_key is empty...\n")
        return None

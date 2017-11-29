#
# Import the weather icons from the json file and display the correct icon for current weather condition
# https://www.youtube.com/watch?v=pTT7HMqDnJw "JSON in Python" by: Socratica
#

import json, urllib


# TODO: if we are going to use a URL to get the API data then use this code and not the function below
# GET_WEATHER_IMG_KEY FUNCTION
# ----------------------------------
# - open the URL with the json weather data
# - create json dictionary from the URL data received
# - convert the json dictionary to a string dictionary so python can work with the data
# - assign the icon key from string dictionary to the imgKey variable
# - return imgKey


# def get_weather_img_key():
#     response = urllib.urlopen(PLEASE INPUT API URL HERE)
#     jData = json.loads(response.read())
#     pData = json.dumps(jData)
#     imgKey = pData["list"]["weather"]["icon"]
#     return imgKey

# GET_WEATHER_IMG_KEY FUNCTION
# ----------------------------------
# - open the file with the json data containing the weather icon key
# - create json dictionary from the file
# - close the file that was just opened
# - convert the json dictionary to a string dictionary so python can work with the data
# - assign the icon key from the string dictionary to the imgKey variable
# - return imgKey


def get_weather_img_key():
    # "open_weather.json" will be where we are getting the API data from
    # if its using a URL some code will need to change
    weather_file = open("open_weather.json", "r")
    jData = json.load(weather_file)
    weather_file.close()
    pData = json.dumps(jData)
    imgKey = pData["list"]["weather"]["icon"]
    return imgKey


# get_weather_img function
#
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


def get_weather_img(icon_key):
    icon_file = open("icon.json", "r")
    jIcons = json.load(icon_file)
    icon_file.close()
    pIcons = json.dumps(jIcons)

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


def main():
    get_weather_img(get_weather_img_key())

# TODO: Change icon.json path to Linux format

import os.path
import json

"""
    This function takes in an icon_name and returns a corresponding icon_key from the icon.json file.
    Returns "None" if the icon_name is not in the dictionary or icon.json file does not exist
    Example:    {
                    "01d": "http://openweathermap.org/img/w/01d.png",
                }
"""


def search_key(icon_name):
    # TODO: Change '.\icon.json' to './icon.sjon' when in Linux environment
    icon_path = os.path.basename('.\icon.json')

    #   Check if the file exist
    if os.path.exists(icon_path):
        """
            Read the JSON file into a dictionary variable [dict_json]
            Search and return the key that matches the API name
            Example of dict_json:   "01d": "http://openweathermap.org/img/w/01d.png"
        """

        try:
            f = open(icon_path, 'r')
        except IOError as e:
            raise type(e)(e.message)
        else:
            dict_json = json.load(f)
            return dict_json.get(icon_name)
    else:
        print("File: %s" % icon_path + " not found")
        return None

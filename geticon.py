# TODO: SECURITY WARNING: keep the secret key used in production secret!
# TODO: Regenerate secret key and place in config.json
# TODO: See project checklist link above before making API_KEYS public
# TODO: Change config.json path to Linux format

import os.path
import json

"""
    This function takes in an api_name and returns a corresponding api_key from the config.json file.
    Returns "None" if the api_name is not in the dictionary or config.json file does not exist
    Example:    {
                    "01d": "http://openweathermap.org/img/w/01d.png",
                }
"""


def search_key(api_name):
    # TODO: Change '.\icon.json' to './icon.sjon' when in Linux environment
    key_path = os.path.basename('.\icon.json')

    #   Check if the file exist
    if os.path.exists(key_path):
        """
            Read the JSON file into a dictionary variable [dict_json]
            Search and return the key that matches the API name
            Example of dict_json:   "01d": "http://openweathermap.org/img/w/01d.png"
        """

        try:
            f = open(key_path, 'r')
        except IOError as e:
            raise type(e)(e.message)
        else:
            dict_json = json.load(f)
            return dict_json.get(api_name)
    else:
        print("File: %s" % key_path + " not found")
        return None

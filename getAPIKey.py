# TODO: SECURITY WARNING: keep the secret key used in production secret!
# TODO: Regenerate secret key and place in config.json
# TODO: See project checklist link below before making API_KEYS public
# TODO: Change config.json path to Linux format

import os.path

from flask import json

"""
    Best practices for securely using API keys: 
        1.  Do not embed API keys directly in code
        2.  Do not store API keys in files inside your application's source tree
        3.  Restrict your API keys to be used by only the IP addresses, referrer URLs, and mobile apps that need them
        4.  Delete unneeded API keys
        5.  Regenerate your API keys periodically
        6.  Review your code before publicly releasing it
        
    Source: https://support.google.com/cloud/answer/6310037?hl=en
"""

"""
    This function takes in an api_name and returns a corresponding api_key from the config.json file.
    Returns "None" if the api_name is not in the dictionary or config.json file does not exist
    Example:    {
                    "marine": "Marine1",
                }
"""


def search_key(api_name):
    key_path = os.path.basename('.\config.json')

    #   Check if the file exist
    if os.path.exists(key_path):
        """
            Read the JSON file into a dictionary variable [dict_json]
            Search and return the key that matches the API name
            Example of dict_json: "marine": "Marine1"
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


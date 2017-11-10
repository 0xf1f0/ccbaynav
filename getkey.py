# TODO: SECURITY WARNING: keep the secret key used in production secret!
# TODO: Regenerate secret key and place in config.json
# TODO: See project checklist link above before making API_KEYS public

import os.path
import json

"""
    This function takes in an api_name and returns a corresponding api_key from the config.json file.
    Returns "None" if the api_name is not in the dictionary or config.json file does not exist
"""


def getkey(api_name):
    key = None
    # TODO: Change '..\config.json' to '../config.sjon' when in Linux environment
    key_path = os.path.abspath('..\config.json')

    #   Check if the file exist
    if os.path.exists(key_path):
        """
            Read the JSON file into a dictionary variable [dict_json]
            Example of dict_json: "marine": "Marine1",
        """
        try:
            with open(key_path, 'r') as f:
                dict_json = json.load(f)
                print dict_json
                # Search and return the key that matches the name provided
                return dict_json.get(api_name)
        finally:
            #   Close the file
            f.close()
    else:
        return None

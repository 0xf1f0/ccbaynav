import requests

"""
    This function returns JSON object for API service request
    Check HTTP status code of api_request to be OK
    Store response in a dictionary
    Write the JSON object to file
"""


def api_data_request(api_url, json_file):
    api_response = requests.get(api_url)
    if api_response.status_code == 200:
        json_data = api_response.json()
        with open(json_file, 'w') as f:
            f.write(api_response.content)
        return json_data
    else:
        #   print api_response.status_code
        return None

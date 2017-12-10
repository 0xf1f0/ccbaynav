from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, render_template

from bokehGraphs import graph_generator
from getAPIData import get_noaa_data

app = Flask(__name__)

# Create and start background scheduler (for Cassandra and NOAA)
schedule = BackgroundScheduler()
schedule.start()

# Create cron scheduler for background data request to NOAA
schedule.add_job(get_noaa_data, trigger='interval', minutes=6, id='noaa_job', replace_existing=True)

# Cassandra
# add a background scheduler for the cassandra data retrieval here


@app.route('/')
def index():
    #   Render index.html as the default page
    #   See index.html in ../templates/
    script, div_list = graph_generator()
    # need to add more divs here if you want to add more graphs
    return render_template("index.html", script=script, div=div_list[0], div1=div_list[1], div2=div_list[2],
                           div3=div_list[3], div4=div_list[4])


# TODO - remove function, included for testing
# def my_listener(event):
#    if event.exception:
#        print('The job crashed :(')
#    else:
#        print('The job worked :)')


# schedule.add_listener(my_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

if __name__ == '__main__':
    app.run(debug=False)


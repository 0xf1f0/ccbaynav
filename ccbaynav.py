# TODO: Change debug mode to false during production
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, render_template

from bokehGraphs import graph_generator
from getAPIData import get_noaa_data

app = Flask(__name__)

# Create cron scheduler for background data request to NOAA
schedule = BackgroundScheduler()
schedule.start()
schedule.add_job(get_noaa_data, trigger='interval', minutes=6, id='noaa_job', replace_existing=True)


@app.route('/')
def index():
    #   Render index.html as the default page
    #   See index.html in ../templates/
    script, div_list = graph_generator()
    # need to add more divs here if you want to add more graphs
    return render_template("index.html", script=script, div=div_list[0], div1=div_list[1], div2=div_list[2],
                           div3=div_list[3], div4=div_list[4])


# TODO - remove function or write to log instead of print, included for testing
def my_listener(event):
    if event.exception:
        print('The job crashed :(')
    else:
        print('The job worked :)')


schedule.add_listener(my_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

if __name__ == '__main__':
    app.run(debug=False)

# TODO - best practice includes this for safety but idk where yet
# schedule.shutdown()

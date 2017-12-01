# import NOAA_request
import json
from datetime import datetime as dt

from bokeh.embed import components
from bokeh.io import show, output_file
from bokeh.models import DatetimeTickFormatter
from bokeh.palettes import Spectral4
from bokeh.plotting import figure


# noaaData = NOAA_request.get_noaa_data()
# print(noaaData)


def to_time(t):
    return dt.strptime(t, '%Y-%m-%d %H:%M')


def create_graph(variable):
    data_file = open("static/api/" + variable + ".json", "r")
    var_data = json.load(data_file)
    data_file.close()
    locations = {"lexington": "8775296", "port_aransas": "8775237", "aransas_pass": "8775241",
                 "bob_hall_pier": "8775870"}
    color = dict(lexington=Spectral4[0], port_aransas=Spectral4[1], aransas_pass=Spectral4[2],
                 bob_hall_pier=Spectral4[3])
    # Add a hover tool
    # hover = HoverTool(tooltips=[("(height,time)", "($x, $y{F}")], formatters={"time" : "datetime"})
    # create a new plot with a title and axis labels
    p = figure(plot_width=729, plot_height=485, title=variable, x_axis_label='Time',
               y_axis_label='Height (ft.)')
    for loc in locations:
        if loc not in var_data:
            print loc + ' does not have var: ' + variable
            continue

        # prepare some data
        y = []
        x = []

        for z in sorted(var_data[loc], key=to_time):
            # print z, var_data[loc][z]
            y.append(var_data[loc][z])
            x.append(dt.strptime(z, '%Y-%m-%d %H:%M'))

        # add a line renderer with legend and line thickness
        p.line(x=x, y=y, legend=loc, line_width=2, line_color=color[loc])

    p.xaxis.formatter = DatetimeTickFormatter(
        minutes=["%a, %r"],
        hours=["%a, %r"],
        days=["%a, %r"]
    )

    # output to static HTML file
    output_file("templates/" + variable + ".html")

    # save the results
    # This opens the graphs in the default browser

    show(p)
    # save(p, filename="waterLvlGraph.html", title="Water Level Graph")

    # generate the javascript code for the file
    script_generator(p, js_file="static/js/bokehGraphs.js")


# function to generate the graphs for each variable
def graph_generator():
    var_list = ['wind_gust', 'wind_direction', 'wind_speed', 'water_level', 'air_temperature', 'water_temperature']
    for var in var_list:
        create_graph(var)


# function to write Bokeh graph javascript to file
COUNTER = 0


def script_generator(p, js_file):
    script, div = components(p)
    global COUNTER
    if COUNTER == 0:
        cmd = 'w'
    else:
        cmd = 'a'
    with open(js_file, cmd) as f:
        COUNTER += 1
        f.write(script)
        f.write(div)
    f.close()


graph_generator()
# import NOAA_request
import json
from datetime import datetime as dt

from bokeh.embed import components
from bokeh.io import output_file
from bokeh.models import DatetimeTickFormatter
from bokeh.models.tools import HoverTool
from bokeh.palettes import Spectral4
from bokeh.plotting import figure


def to_time(t):
    return dt.strptime(t, '%Y-%m-%d %H:%M')


def create_graph(variable):
    data_file = open("static/api/" + variable + ".json", "r")
    var_data = json.load(data_file)
    data_file.close()
    locations = {"lexington": "blue", "port_aransas": "red", "aransas_pass": "green",
                 "bob_hall_pier": "black"}
    color = dict(lexington=Spectral4[0], port_aransas=Spectral4[1], aransas_pass=Spectral4[2],
                 bob_hall_pier=Spectral4[3])
    # color = dict(lexington=Spectral4[0], port_aransas=Spectral4[1], aransas_pass=Spectral4[2],
    #             bob_hall_pier=Spectral4[3])

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

    # Add a hover tool
    hover = HoverTool(tooltips=[("Time", "@x{%c}"), ("Height(ft)", "@y")],
                      formatters={"x": "datetime"}, mode="mouse")
    p.add_tools(hover)

    p.xaxis.formatter = DatetimeTickFormatter(
        minutes=["%a, %r"],
        hours=["%a, %r"],
        days=["%a, %r"]
    )

    # output to static HTML file
    output_file("templates/" + variable + ".html")

    # save the results
    # save(p, filename="waterLvlGraph.html", title="Water Level Graph")

    # This opens the graphs in the default browser
    # show(p)

    return p

# function to generate the graphs for each variable
def graph_generator():
    # TODO: Add a different way to visualize the wind direction in a graph or something later
    # var_list = ['wind_gust', 'wind_direction', 'wind_speed', 'water_level', 'air_temperature', 'water_temperature']
    var_list = ['wind_gust', 'wind_speed', 'water_level', 'air_temperature', 'water_temperature']
    figure_list = []
    for var in var_list:
        figure_list.append(create_graph(var))
    script, div_list = components(figure_list)
    return script, div_list


graph_generator()

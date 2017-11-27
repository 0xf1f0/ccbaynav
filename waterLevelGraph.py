# import NOAA_request
import datetime
import json

from bokeh.io import output_file, show
from bokeh.plotting import figure

# noaaData = NOAA_request.get_noaa_data()
# print(noaaData)
waterLvl_File = open("lexington.json", "r")
jWL = json.load(waterLvl_File)
waterLvl_File.close()


# prepare some data
y = []
x = []

for z in jWL['water_level']:
    print z, jWL['water_level'][z]
    y.append(jWL['water_level'][z])
    x.append(datetime.datetime.strptime(z, '%Y-%m-%d %H:%M'))

# create a new plot with a title and axis labels
p = figure(plot_width=729, plot_height=485, title="Water Level Graph", x_axis_label='Time', y_axis_label='Height (ft.)')

# add a line renderer with legend and line thickness
p.line(x=x, y=y, legend="Water Level", line_width=2)

# output to static HTML file
output_file("waterLvlGraph.html")

# save the results
show(p)
#save(p, filename="waterLvlGraph.html", title="Water Level Graph")

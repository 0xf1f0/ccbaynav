from bokeh.io import output_file, save
from bokeh.models import GeoJSONDataSource
from bokeh.plotting import figure

geo_source = GeoJSONDataSource(geojson="LOCATION OF THE JSON DATA FILE")

# prepare some data
# x = [1, 2, 3, 4, 5]
# y = [6, 7, 2, 4, 5]

# create a new plot with a title and axis labels
p = figure(plot_width=729, plot_height=485, title="Water Level Graph", x_axis_label='Time', y_axis_label='Height (ft.)')

# add a line renderer with legend and line thickness
p.line(x='x', y='y', legend="Water Level", line_width=2, source=geo_source)

# output to static HTML file
output_file("waterLvlGraph.html")

# save the results
save(p, filename="waterLvlGraph.html", title="Water Level Graph")

from bokeh.plotting import figure, output_file, show

# prepare some data
x = [1, 2, 3, 4, 5]
y = [6, 7, 2, 4, 5]

# output to static HTML file
output_file("lines.html")

# create a new plot with a title and axis labels
p = figure(plot_width=729, plot_height=485, title="Water Level Graph", x_axis_label='Time', y_axis_label='Height (ft.)')

# add a line renderer with legend and line thickness
p.line(x, y, legend="Water Level", line_width=2)

# show the results
show(p)

# TODO: Change debug mode to false during production
# TODO: Create a 404 Page
from flask import Flask, render_template
from bokehGraphs import graph_generator

app = Flask(__name__)


@app.route('/')
def index():
    #   Render index.html as the default page
    #   See index.html in ../templates/
    script, div_list = graph_generator()
    # need to add more divs here if you want to add more graphs
    return render_template("index.html", script=script, div=div_list[0], div1=div_list[1], div2=div_list[2],
                           div3=div_list[3], div4=div_list[4])

@app.route('/waterlevel')
def waterLevel():
    return render_template("water_level.html")


@app.route('/watertemp')
def waterTemp():
    return render_template("water_temperature.html")


@app.route('/winddirection')
def windDir():
    return render_template("wind_direction.html")


@app.route('/windgust')
def windGust():
    return render_template("wind_gust.html")


@app.route('/windspeed')
def windSpeed():
    return render_template("wind_speed.html")


@app.route('/airtemp')
def airTemp():
    return render_template("air_temperature.html")


if __name__ == '__main__':
    app.run(debug=False)

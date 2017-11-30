# TODO: Change debug mode to false during production
# TODO: Create a 404 Page
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    #   Render index.html as the default page
    #   See index.html in ../templates/
    return render_template("index.html")


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


if __name__ == '__main__':
    app.run(debug=False)

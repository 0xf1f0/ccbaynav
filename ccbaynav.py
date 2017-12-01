# TODO: Change debug mode to false during production
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

if __name__ == '__main__':
    app.run(debug=False)

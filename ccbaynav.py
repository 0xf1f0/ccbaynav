from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():

    #   Render index.html as the default page
    #   See index.html in ../templates/
    return render_template("index.html")


if __name__ == '__main__':
    app.run()

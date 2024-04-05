from flask import Flask

from src import routes

app = Flask(__name__, static_url_path='/static')

app.register_blueprint(routes.projects)

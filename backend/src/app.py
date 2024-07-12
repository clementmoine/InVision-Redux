from flask import Flask
from dotenv import load_dotenv

from src import routes

load_dotenv()

app = Flask(__name__, static_url_path="/static")

app.register_blueprint(routes.screens)
app.register_blueprint(routes.projects)
app.register_blueprint(routes.tags)

from flask import Flask
from dotenv import load_dotenv
import os

from src import routes

load_dotenv()

docs_root = os.getenv("DOCS_ROOT", "static")

app = Flask(__name__, static_url_path="/static", static_folder=docs_root)

app.register_blueprint(routes.screens)
app.register_blueprint(routes.projects)
app.register_blueprint(routes.tags)
app.register_blueprint(routes.scrape)

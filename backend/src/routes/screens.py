import os
import json
import math
from unidecode import unidecode

from flask import Blueprint, jsonify, current_app, request

blueprint = Blueprint("screens", __name__)


@blueprint.route("/projects/<int:project_id>/screens/<int:screen_id>")
def get_screen(project_id, screen_id):
    screen_dir = os.path.join(
        current_app.static_folder,
        "projects",
        str(project_id),
        "screens",
        str(screen_id),
    )

    screen_json_path = os.path.join(screen_dir, "screen.json")

    try:
        if os.path.exists(screen_json_path):
            with open(screen_json_path, "r") as screen_file:
                screen_data = json.load(screen_file)

        return jsonify(screen_data)
    except FileNotFoundError:
        return "Screen not found", 404
    except Exception as e:
        return f"Error fetching screen: {e}", 500


@blueprint.route("/projects/<int:project_id>/screens/<int:screen_id>/inspect")
def get_screen_inspect(project_id, screen_id):
    screen_dir = os.path.join(
        current_app.static_folder,
        "projects",
        str(project_id),
        "screens",
        str(screen_id),
    )

    screen_json_path = os.path.join(screen_dir, "inspect.json")

    try:
        if os.path.exists(screen_json_path):
            with open(screen_json_path, "r") as screen_file:
                screen_data = json.load(screen_file)

        return jsonify(screen_data)
    except FileNotFoundError:
        return "Screen not found", 404
    except Exception as e:
        return f"Error fetching screen: {e}", 500

import os
import json

from flask import Blueprint, jsonify, current_app

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
        else:
            return (
                "Screen not found",
                404,
            )
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

    inspect_json_path = os.path.join(screen_dir, "inspect.json")

    try:
        if os.path.exists(inspect_json_path):
            with open(inspect_json_path, "r") as inspect_file:
                inspect_data = json.load(inspect_file)

            return jsonify(inspect_data)
        else:
            return (
                "Inspect data not found",
                404,
            )
    except FileNotFoundError:
        return "Inspect data not found", 404
    except Exception as e:
        return f"Error fetching inspect data: {e}", 500


@blueprint.route("/projects/<int:project_id>/screens/<int:screen_id>/history")
def get_screen_history(project_id, screen_id):
    screen_dir = os.path.join(
        current_app.static_folder,
        "projects",
        str(project_id),
        "screens",
        str(screen_id),
    )

    history_json_path = os.path.join(screen_dir, "history.json")

    try:
        if os.path.exists(history_json_path):
            with open(history_json_path, "r") as history_file:
                history_data = json.load(history_file)

            return jsonify(history_data)
        else:
            return (
                "History data not found",
                404,
            )
    except FileNotFoundError:
        return "History data not found", 404
    except Exception as e:
        return f"Error fetching history data: {e}", 500

import os
import json
from flask import Blueprint, jsonify, current_app

blueprint = Blueprint("tags", __name__)


@blueprint.route("/tags")
def fetch_tags():
    try:
        tags_json_path = os.path.join(current_app.static_folder, "common/tags.json")

        if os.path.exists(tags_json_path):
            # Read JSON file
            with open(tags_json_path, "r") as file:
                tags = json.load(file)
                return jsonify(tags)
        else:
            return "Tags file not found", 404
    except Exception as e:
        return f"Error fetching tags: {e}", 500

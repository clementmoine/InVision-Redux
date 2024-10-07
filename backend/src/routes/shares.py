import os
import json

from flask import Blueprint, jsonify, current_app

blueprint = Blueprint("shares", __name__)


@blueprint.route("/share/<string:share_id>")
def get_project_from_share_id(share_id):
    # Convert the input share_id to lowercase for case-insensitive comparison
    share_id = share_id.lower()

    # Define the directory where projects are stored
    projects_dir = os.path.join(current_app.static_folder, "projects")

    try:
        # Iterate over all projects in the projects directory
        for project_id in os.listdir(projects_dir):
            project_dir = os.path.join(projects_dir, project_id)

            # Check if it's a directory (project folder)
            if os.path.isdir(project_dir):
                # Define the path to the shares.json file
                shares_json_path = os.path.join(project_dir, "shares.json")

                # Check if shares.json exists in the project folder
                if os.path.exists(shares_json_path):
                    # Open and read the shares.json file
                    with open(shares_json_path, "r") as file:
                        shares_data = json.load(file)

                        # Check if the share_id exists in the shares data (case-insensitive)
                        for share in shares_data.get("shares", []):
                            # Convert the share id to string and make it lowercase for comparison
                            if str(share.get("key", "")).lower() == share_id:
                                # Return the project ID if share_id is found
                                return jsonify({"project_id": project_id}), 200

        # If share_id not found in any project
        return jsonify({"error": "Share ID not found"}), 404

    except FileNotFoundError:
        return jsonify({"error": "Projects directory not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Error fetching share: {str(e)}"}), 500

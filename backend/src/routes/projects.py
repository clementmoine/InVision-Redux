import os
import json

from flask import Blueprint, send_file, jsonify, url_for, current_app

blueprint = Blueprint("projects", __name__)

STATIC_FOLDER = "src/static/"


@blueprint.route("/projects")
def get_projects():
    projects_dir = os.path.join(current_app.static_folder, "projects")
    project_files = []

    try:
        # Parcourir le dossier projects
        for project_id in os.listdir(projects_dir):
            project_dir = os.path.join(projects_dir, project_id)
            if os.path.isdir(project_dir):
                project_json_path = os.path.join(project_dir, "project.json")
                if os.path.exists(project_json_path):
                    # Lire le contenu du fichier JSON
                    with open(project_json_path, "r") as file:
                        project_data = json.load(file)
                        project_files.append(project_data)
        return jsonify(project_files)
    except FileNotFoundError:
        return "Projects directory not found", 404
    except Exception as e:
        return f"Error fetching projects: {e}", 500


@blueprint.route("/projects/<int:project_id>")
def get_project(project_id):
    return f"Détails du projet {project_id}"

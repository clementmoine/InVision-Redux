import os
import json

from flask import Blueprint, jsonify, current_app, request

blueprint = Blueprint("projects", __name__)

STATIC_FOLDER = "src/static/"


@blueprint.route("/projects")
def get_projects():
    # Get pagination parameters
    limit = int(request.args.get("limit", 10))
    page = int(request.args.get("page", 1))

    # Get type and tag if provided
    project_type = request.args.get("type")
    project_tag = request.args.get("tag")
    search_query = request.args.get("search")

    # Get specific list of projects by their ids
    project_ids = request.args.getlist("project_ids")

    projects_dir = os.path.join(current_app.static_folder, "projects")
    projects = []

    try:
        # Browse projects folder
        for project_id in os.listdir(projects_dir):
            project_dir = os.path.join(projects_dir, project_id)

            if os.path.isdir(project_dir):
                project_json_path = os.path.join(project_dir, "project.json")

                if os.path.exists(project_json_path):
                    # Read JSON content
                    with open(project_json_path, "r") as file:
                        project = json.load(file)

                        # Check if project should be included based on type and tag parameters
                        project_data = project.get("data")

                        if (
                            (  # Project type matches the requested type
                                not project_type
                                or project_data.get("type") == project_type
                            )
                            and (  # Project tags includes the requested tag
                                not project_tag
                                or str(project_tag)
                                in [
                                    str(tag.get("id"))
                                    for tag in project_data.get("tags", [])
                                ]
                            )
                            and (  # Project name matches the search query
                                not search_query
                                or search_query.lower()
                                in project_data.get("name", "").lower()
                            )
                        ):
                            if not project_ids or project_id in project_ids:
                                projects.append(project)

        # Pagination
        total_projects = len(projects)
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_projects = projects[start_index:end_index]

        return jsonify(
            {
                "data": paginated_projects,
                "total": total_projects,
                "page": page,
                "limit": limit,
            }
        )
    except FileNotFoundError:
        return "Projects directory not found", 404
    except Exception as e:
        return f"Error fetching projects: {e}", 500


@blueprint.route("/projects/<int:project_id>")
def get_project(project_id):
    return f"Détails du projet {project_id}"

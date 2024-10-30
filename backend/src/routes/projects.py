import json
import math
from pathlib import Path
from unidecode import unidecode
from concurrent.futures import ThreadPoolExecutor

from flask import Blueprint, jsonify, current_app, request

blueprint = Blueprint("projects", __name__)


@blueprint.route("/projects")
def fetch_projects():
    # Get pagination parameters
    limit = int(request.args.get("limit", 40))
    page = int(request.args.get("page", 1))

    # Get type, tag and search query if provided
    project_type = request.args.get("type", "all")
    project_tag = request.args.get("tag", "all")
    search_query = request.args.get("search", "")
    sort_by = request.args.get("sort", "updatedAt")

    # Ignore type and tag if they equal 'all'
    if project_type == "all":
        project_type = (
            None  # We want to include both archived and non-archived projects
        )
    if project_tag == "all":
        project_tag = None

    # Get specific list of projects by their ids
    project_ids = request.args.getlist("project_ids")

    projects_dir = Path(current_app.static_folder) / "projects"
    projects = []

    def process_project(project_dir):
        """Process a single project."""
        project_json_path = project_dir / "project.json"
        if project_json_path.exists():
            with project_json_path.open("r") as file:
                project = json.load(file)
                project_data = project.get("data")

                # Apply filters
                include_project = (
                    (
                        project_type is None
                        or project_data.get("type") == project_type
                        or (
                            project_type == "archived"
                            and project_data.get("isArchived")
                        )
                    )
                    and (
                        not project_tag
                        or any(
                            str(tag.get("id")) == str(project_tag)
                            for tag in project_data.get("tags", [])
                        )
                    )
                    and (
                        not search_query
                        or unidecode(search_query.lower())
                        in unidecode(project_data.get("name", "").lower())
                    )
                    and (not project_ids or project_data.get("id") in project_ids)
                )

                if include_project:
                    return project
        return None

    try:
        # Multithreaded project processing
        with ThreadPoolExecutor() as executor:
            # Filter valid projects by removing `None` results
            projects = list(
                filter(None, executor.map(process_project, projects_dir.iterdir()))
            )

        # Sort projects based on the provided sort parameter
        if sort_by == "updatedAt":
            projects.sort(key=lambda x: x["data"]["updatedAt"], reverse=True)
        elif sort_by == "name":
            projects.sort(key=lambda x: x["data"]["name"])

        # Pagination
        total_projects = len(projects)
        total_pages = math.ceil(total_projects / limit)
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_projects = projects[start_index:end_index]

        # Calculate next page number
        next_page = page + 1 if end_index < total_projects else 1

        # Calculate previous page number
        previous_page = page - 1 if start_index > 0 else total_pages

        return jsonify(
            {
                "data": paginated_projects,
                "total": total_projects,
                "page": page,
                "limit": limit,
                "nextPage": next_page,
                "previousPage": previous_page,
            }
        )
    except FileNotFoundError:
        return "Projects directory not found", 404
    except Exception as e:
        return f"Error fetching projects: {e}", 500


@blueprint.route("/projects/<int:project_id>")
def get_project(project_id):
    # Get search query if provided
    search_query = request.args.get("search", "")
    project_dir = Path(current_app.static_folder) / "projects" / str(project_id)
    project_json_path = project_dir / "project.json"
    screens_json_path = project_dir / "screens.json"

    try:
        with project_json_path.open("r") as project_file:
            project_data = json.load(project_file)

        if screens_json_path.exists():
            with screens_json_path.open("r") as screens_file:
                screens_data = json.load(screens_file)

                # Filter the screens
                filtered_screens = [
                    screen
                    for screen in screens_data.get("screens", [])
                    if unidecode(search_query.lower())
                    in unidecode(screen.get("name", "").lower())
                ]
                screens_data["screens"] = filtered_screens
                # Filter the archived screens
                filtered_archived_screens = [
                    screen
                    for screen in screens_data.get("archivedscreens", [])
                    if unidecode(search_query.lower())
                    in unidecode(screen.get("name", "").lower())
                ]
                screens_data["archivedscreens"] = filtered_archived_screens
                # Add the screens_data to the project_data
                project_data["screens"] = screens_data

        return jsonify(project_data)

    except FileNotFoundError:
        return "Project not found", 404
    except Exception as e:
        return f"Error fetching project: {e}", 500

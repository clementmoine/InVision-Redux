import os
import shutil
from src.download import json_patch_to_local_assets, save_json_data
from src.utils import color_print, color_input, is_test_mode
from src.api_requests import fetch_projects, fetch_tags
from src.api_requests import get_project_details, get_screen_details, get_screen_inspect_details

# Constants for directories
DOCS_ROOT = os.path.join('../', os.getenv('DOCS_ROOT', './docs'))

# Function to ask the user if they want to overwrite the existing docs folder
def ask_user():
    """
    Asks the user whether to overwrite the existing docs folder.

    Returns:
        bool: True if the user wants to overwrite, False otherwise.
    """
    while True:
        response = color_input("Docs folder already exists. Do you want to overwrite it? (yes/no): ", "yellow").strip().lower()

        if response in ('yes', 'no', 'y', 'n', 'o', 'oui'):
            return response in ('yes', 'y', 'oui')
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")

# Remove the docs folder if it exists and the user wants to overwrite it
if os.path.exists(DOCS_ROOT):
    if ask_user():
        shutil.rmtree(DOCS_ROOT)
    else:
        color_print("Aborting operation.", "yellow")
        exit()
  
def browse_project(project, session):
    """
    Browse a project, download its assets, and save JSON data locally.

    Args:
        project (dict): Project data.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        dict or None: Updated project data if successful, None otherwise.
    """
    color_print(f" • {project['data']['name']} ({project['id']}):", 'white')

    project_folder = os.path.join(DOCS_ROOT, "projects", str(project['id']))
    os.makedirs(project_folder, exist_ok=True)

    patched_project = json_patch_to_local_assets(project, project['id'], session)
    if not save_json_data(patched_project, project_folder, "project.json"):
        color_print(f"   ✘  Failed to save project data", 'red')
        return None

    details = get_project_details(project, session)
    if details:
        archived_screens_count = details['archivedScreensCount']
        screens_count = len(details['screens'])
        color_print(f"   ⮑  Project browsed ({screens_count} screens, {archived_screens_count} archived)", 'green')

        details_patched = json_patch_to_local_assets(details, project['id'], session)
        if not save_json_data(details_patched, project_folder, "screens.json"):
            color_print(f"   ✘  Failed to save screens data", 'red')
            return None

        browsed_screen_ids = set()

        for screen in details.get('screens', []):
            screen_details = get_screen_details(screen, session)

            if screen_details:
                screen_details_patched = json_patch_to_local_assets(screen_details, project['id'], session)
                screen_json_folder = os.path.join(project_folder, "assets/screens", str(screen['id']))

                if not save_json_data(screen_details_patched, screen_json_folder, "screen.json"):
                    color_print(f"   ✘  Failed to save screen details for {screen['name']}", 'red')

                    return None
                
                screen_inspect_details = get_screen_inspect_details(screen, session)

                if screen_inspect_details:
                    screen_inspect_details_patched = json_patch_to_local_assets(screen_inspect_details, project['id'], session)

                    if not save_json_data(screen_inspect_details_patched, screen_json_folder, "inspect.json"):
                        color_print(f"   ✘  Failed to save inspect data for {screen['name']}", 'red')

                        return None
                    
                    color_print(f"   ⮑  Screen {screen['name']} (details, inspect) gathered", 'green')

                    browsed_screen_ids.add(screen['id'])

        if len(browsed_screen_ids) == screens_count:
            color_print(f"   ⮑  All screens browsed properly", 'green')

            return project
        else:
            color_print(f"   ✘  Failed to browse some screens", 'red')

            return None
    else:
        color_print(f"   ✘  Failed to browse the project", 'red')

        return None
  
def browse_projects(session):
    projects = fetch_projects(session)

    # In test mode we process one project of each type
    if is_test_mode():
        color_print("╭───────────────────────────────────────────────╮", "yellow")
        color_print("│ Test mode enabled: Fetching only one project! │", "yellow")
        color_print("╰───────────────────────────────────────────────╯", "yellow")

        projects = {project['type']: project for project in projects}.values()

    # WIP : Only manage prototypes
    projects = [project for project in projects if project['type'] == 'prototype']

    tags = fetch_tags(session)

    if projects:
        color_print(f"\nRetrieving {len(projects)} projects:", 'green')
        
        successfully_exported_project_ids = set()
                
        for project in projects:
            project['data']['tags'] = [tag for tag in tags if project['id'] in tag['prototypeIDs']]

            if browse_project(project, session):
                successfully_exported_project_ids.add(project["id"])

        #  Generate index page only for successfully exported projects
        successfully_exported_projects = [project for project in projects if project['id'] in successfully_exported_project_ids]
        if successfully_exported_projects:
            # Compare the success to global list to find failed ones
            failed_projects = [project for project in projects if project not in successfully_exported_projects]
            
            if failed_projects:
                color_print("\nSome projects failed to export.", 'red')
            else:
                color_print("\nAll projects were successfully exported.", 'yellow')
        else:
            color_print("\nNo projects were successfully exported.", 'red')
    else:
        color_print("\nNo projects were found.", 'red')

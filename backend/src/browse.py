import os
import json
import shutil
from src.utils import color_print, color_input
from urllib.parse import urlparse
from src.api_requests import get_project_details, get_screen_details, get_screen_inspect_details

# Constants for directories
ROOT_DIR = "./docs"
BASE_DIR = os.path.join(ROOT_DIR, "projects/")
ASSETS_DIR = "assets/"

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
if os.path.exists(ROOT_DIR):
    if ask_user():
        shutil.rmtree(ROOT_DIR)
    else:
        color_print("Aborting operation.", "yellow")
        exit()

def download_file(url, destination, session):
    """
    Downloads a file from the given URL to the specified destination.

    Args:
        url (str): The URL of the file to download.
        destination (str): The path where the file will be saved.
        session (requests.Session): Session object for making HTTP requests.
    
    Returns:
        bool: True if the file was downloaded successfully, False otherwise.
    """
    response = session.get(url)
    if response.status_code == 200:
        # Save the file content to the destination
        with open(destination, "wb") as f:
            f.write(response.content)
        return True
    else:
        color_print(f"   ✘  Failed to download file: {url}", 'red')
        return False

def patch_to_local_assets(json_data, project_id, session):
    """
    Downloads files from URLs in the JSON data and updates the JSON with local file paths.

    Args:
        json_data (dict): JSON data containing URLs of files to be downloaded.
        project_id (str): ID of the project.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        dict: Updated JSON data with local file paths.
    """
    base_dir = os.path.join(BASE_DIR, str(project_id), ASSETS_DIR)
    os.makedirs(base_dir, exist_ok=True)

    def download_and_patch(data):
        """
        Recursively traverses the JSON data, downloads files from URLs, and updates the data with local file paths.

        Args:
            data (dict or list): JSON data to be processed.
        """
        if isinstance(data, dict):
            for key, value in list(data.items()):
                if isinstance(value, str) and "invisionapp.com" in value:
                    # Clean the URL to remove query parameters
                    url_without_params = urlparse(value)._replace(query='').geturl()

                    dir_name, file_name = os.path.split(url_without_params.split("invisionapp.com/")[-1])

                    # Custom file destination for thumbnails and screen image since they are named identically 
                    if "screens/thumbnails" in dir_name or "screens/files" in dir_name:
                        screen_id, file_extension = os.path.splitext(file_name)
                        
                        if screen_id:
                            file_name = f"{'thumbnail' if 'thumbnails' in dir_name else 'image'}{file_extension}"
                            dir_name = f"screens/{screen_id}"

                    file_path = os.path.join(base_dir, dir_name, file_name)
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)

                    if download_file(value, file_path, session):
                        data[key] = os.path.relpath(file_path, start=os.path.join(BASE_DIR, str(project_id)))
                else:
                    download_and_patch(value)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                download_and_patch(item)

    updated_json_data = json_data.copy()
    download_and_patch(updated_json_data)

    return updated_json_data

def save_json_data(data, folder_path, file_name):
    """
    Saves JSON data to a file.

    Args:
        data (dict): The JSON data to be saved.
        folder_path (str): The path of the folder where the file will be saved.
        file_name (str): The name of the file.

    Returns:
        bool: True if the data was saved successfully, False otherwise.
    """
    file_path = os.path.join(folder_path, file_name)

    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "w") as json_file:
            json.dump(data, json_file, indent=4)

        return True
    except Exception as e:
        print(f"Failed to save JSON data to {file_path}: {e}")

        return False
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

    project_folder = os.path.join(BASE_DIR, str(project['id']))
    os.makedirs(project_folder, exist_ok=True)

    patched_project = patch_to_local_assets(project, project['id'], session)
    if not save_json_data(patched_project, project_folder, "project.json"):
        color_print(f"   ✘  Failed to save project data", 'red')
        return None

    details = get_project_details(project, session)
    if details:
        archived_screens_count = details['archivedScreensCount']
        screens_count = len(details['screens'])
        color_print(f"   ⮑  Project browsed ({screens_count} screens, {archived_screens_count} archived)", 'green')

        details_patched = patch_to_local_assets(details, project['id'], session)
        if not save_json_data(details_patched, project_folder, "screens.json"):
            color_print(f"   ✘  Failed to save screens data", 'red')
            return None

        browsed_screen_ids = set()

        for screen in details.get('screens', []):
            screen_details = get_screen_details(screen, session)

            if screen_details:
                screen_details_patched = patch_to_local_assets(screen_details, project['id'], session)
                screen_json_folder = os.path.join(project_folder, ASSETS_DIR, "screens", str(screen['id']))

                if not save_json_data(screen_details_patched, screen_json_folder, "screen.json"):
                    color_print(f"   ✘  Failed to save screen details for {screen['name']}", 'red')

                    return None
                
                screen_inspect_details = get_screen_inspect_details(screen, session)

                if screen_inspect_details:
                    screen_inspect_details_patched = patch_to_local_assets(screen_inspect_details, project['id'], session)

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

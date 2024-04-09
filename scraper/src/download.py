import os
import json
from urllib.parse import urlparse
from src.utils import color_print, is_link

# Constants for directories
DOCS_ROOT = os.path.join("../", os.getenv("DOCS_ROOT", "./docs"))


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
    if os.path.exists(destination):
        return True

    response = session.get(url)
    if response.status_code == 200:
        # Save the file content to the destination
        with open(destination, "wb") as f:
            f.write(response.content)
        return True
    else:
        color_print(f"   ✘  Failed to download file: {url}", "red")
        return False


def json_patch_to_local_assets(json_data, project_id, session):
    """
    Downloads files from URLs in the JSON data and updates the JSON with local file paths.

    Args:
        json_data (dict): JSON data containing URLs of files to be downloaded.
        project_id (str): ID of the project.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        dict: Updated JSON data with local file paths.
    """
    assets_dir = os.path.join(DOCS_ROOT, "projects", str(project_id), "assets")
    os.makedirs(assets_dir, exist_ok=True)

    avatars_dir = os.path.join(DOCS_ROOT, "common/avatars")
    os.makedirs(avatars_dir, exist_ok=True)

    def download_and_patch(data):
        """
        Recursively traverses the JSON data, downloads files from URLs, and updates the data with local file paths.

        Args:
            data (dict or list): JSON data to be processed.
        """
        if isinstance(data, dict):
            for key, value in list(data.items()):
                if (
                    isinstance(value, str)
                    and "invisionapp.com" in value
                    and is_link(value)
                ):
                    # Clean the URL to remove query parameters
                    url_without_params = urlparse(value)._replace(query="").geturl()

                    dir_name, file_name = os.path.split(
                        url_without_params.split("invisionapp.com/")[-1]
                    )

                    # Custom case for common assets
                    if "avatars" in dir_name:
                        file_path = os.path.join(avatars_dir, file_name)

                    # Project assets
                    else:
                        # Custom file destination for thumbnails and screen image since they are named identically
                        if (
                            "screens/thumbnails" in dir_name
                            or "screens/files" in dir_name
                        ):
                            screen_id, file_extension = os.path.splitext(file_name)

                            if screen_id:
                                file_name = f"{'thumbnail' if 'thumbnails' in dir_name else 'image'}{file_extension}"
                                dir_name = f"screens/{screen_id}"

                        file_path = os.path.join(assets_dir, dir_name, file_name)

                    os.makedirs(os.path.dirname(file_path), exist_ok=True)

                    if download_file(value, file_path, session):
                        data[key] = "/" + os.path.relpath(
                            file_path,
                            start=DOCS_ROOT,
                        )
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

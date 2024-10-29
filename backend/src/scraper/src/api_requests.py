import os
from bs4 import BeautifulSoup
from requests.exceptions import HTTPError, RequestException

import time
import json
from urllib.parse import urlparse
from .utils import color_print, is_link

max_retries = 10
cooldown = 120

# Constants for directories
DOCS_ROOT = os.getenv("DOCS_ROOT", "./docs")


def request(session, method, *args, **kwargs):
    retries = 0

    while retries < max_retries:
        try:
            if method == "GET":
                response = session.get(*args, **kwargs)
            elif method == "POST":
                response = session.post(*args, **kwargs)
            elif method == "PUT":
                response = session.put(*args, **kwargs)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            if response and response.status_code == 200:
                if response.cookies:
                    session.cookies.update(response.cookies)
                return response
            elif not response or response.status_code == 429:  # Rate limit exceeded
                # print("API rate limit exceeded. Retrying after cooldown...")
                time.sleep(cooldown)  # Wait before restart
                retries += 1
            else:
                error_message = "Unknown error"
                if response:
                    error_message = response.text

                color_print(f"Failed to fetch data: {error_message}", "red")
                return None
        except HTTPError as e:
            color_print(f"HTTP error occurred: {str(e)}", "red")
            time.sleep(cooldown)
            retries += 1
        except RequestException as e:
            color_print(f"Request exception occurred: {str(e)}", "red")
            time.sleep(cooldown)
            retries += 1
        except Exception as e:
            color_print(f"An unexpected error occurred: {str(e)}", "red")
            time.sleep(cooldown)
            retries += 1

    color_print("Maximum number of retries reached. Aborting.", "red")
    return None


def login_classic(email, password, session):
    url = "https://login.invisionapp.com/login-api/api/v2/login"
    data = {"deviceID": "App", "email": email, "password": password}

    response = request(session, "POST", url=url, json=data)

    if response and response.status_code == 200:
        return session.cookies.get_dict()
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Classic authentication failed: {error_message}", "red")

        return None


def login_api(email, password, session):
    url = "https://projects.invisionapp.com/api/account/login"
    data = {"email": email, "password": password, "webview": "false"}
    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "POST", url=url, headers=headers, data=data)

    if response and response.status_code == 200:
        return session.cookies.get_dict()
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"API authentication failed: {error_message}", "red")

        return None


def get_user_id(session):
    url = "https://projects.invisionapp.com/api:unifiedprojects.getProjects"
    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

        user_id = response.json().get("account.id")

        return user_id
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to get user id: {error_message}", "red")
        return None


def fetch_tags(session):
    url = "https://projects.invisionapp.com/api:unifiedprojects.getTags"
    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers)

    if response and response.status_code == 200:

        tags = response.json().get("tags")

        return tags
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch tags: {error_message}", "red")
        return None


def fetch_projects(isArchived, isCollaborator, session):
    url = "https://projects.invisionapp.com/api:unifiedprojects.getProjects"
    params = {"isArchived": isArchived, "isCollaborator": isCollaborator}
    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        projects = response.json().get("results")

        return projects
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch projects: {error_message}", "red")
        return None


def export_project(project, user_id, session):
    try:
        if project["type"] == "prototype":
            url = f'https://projects.invisionapp.com/d/zipexport/generate/debugProjectID/{project["id"]}/debugUserID/{user_id}'
        elif project["type"] == "board":
            url = "https://projects.invisionapp.com/d/board_offline_zip_export/generate"
        else:
            color_print(f"Unknown project type: {project['type']}", "red")
            return None

        headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}
        data = {
            "boardID": project["id"],
            "projectid": project["id"],
            "preventHotspotHinting": "false",
            "preventBrowse": "false",
            "preventBranding": "true",
        }

        response = request(session, "POST", url=url, headers=headers, data=data)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        if project["type"] == "prototype":
            download_link_element = soup.find("a", class_="button export")
        else:
            download_link_element = soup.find("a", class_="download-box__button")

        if download_link_element:
            download_link = download_link_element.get("href")
            return download_link
        else:
            color_print(f"No download link found.", "red")
            return None

    except HTTPError as http_err:
        color_print(f"HTTP error occurred during the request: {http_err}", "red")
        return None
    except Exception as err:
        color_print(f"Error exporting the project: {err}", "red")
        return None


def fetch_project_shares(project, session):
    url = "https://projects.invisionapp.com/api:project_shares_tab_partials.getView"
    params = {
        "prototypeID": project["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # Shares including key and password to be used with https://invis.io/${key}
        project_shares = response.json()

        return project_shares
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch projects shares: {error_message}", "red")
        return None


def get_project_archived_screens(project, session):
    url = (
        "https://projects.invisionapp.com/api:desktop_partials.projectScreens2Archived"
    )
    params = {
        "id": project["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # Details includes groups and screens
        project_details = response.json()

        return project_details
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(
            f"Failed to fetch projects archived screens: {error_message}", "red"
        )
        return None


def get_project_screens(project, session):
    url = "https://projects.invisionapp.com/api:desktop_partials.projectScreens2Grouped"
    params = {
        "id": project["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # Details includes groups and screens
        project_details = response.json()

        return project_details
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch projects screens: {error_message}", "red")
        return None


def get_screen_details(screen, session):

    url = (
        "https://projects.invisionapp.com/api:desktop_partials/screenQuickView"
        if screen["isArchived"]
        else "https://projects.invisionapp.com/api:desktop_partials.consoleScreen"
    )
    params = {
        "screenID": screen["id"],
        "trigger": "initial-load",  # Possible values: (navigation.mode, navigation.screen, initial-load, event.reload)
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # Screen details includes hotspots
        screen_details = response.json()

        return screen_details
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch screen details: {error_message}", "red")
        return None


def get_project_assets(project, session):
    url = "https://projects.invisionapp.com/api:inspect.getProjectAssets"
    params = {
        "projectID": project["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        project_assets = response.json()

        return project_assets
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch screen inspect details: {error_message}", "red")
        return None


def get_screen_inspect_details(screen, session):
    url = "https://projects.invisionapp.com/api:inspect.getExtractionJSON"
    params = {
        "id": screen["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # Inspect details includes layers
        screen_inspect_details = response.json()

        return screen_inspect_details
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch screen inspect details: {error_message}", "red")
        return None


def get_screen_history(screen, session):
    url = "https://projects.invisionapp.com/api:desktop_partials/screenHistory"
    params = {
        "screenID": screen["id"],
    }

    headers = {"x-xsrf-token": session.cookies.get("XSRF-TOKEN")}

    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        screen_history = response.json()

        return screen_history
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch screen history: {error_message}", "red")
        return None


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

    response = request(session, "GET", url=url)
    if response and response.status_code == 200:
        # Save the file content to the destination
        with open(destination, "wb") as f:
            f.write(response.content)
        return True
    else:
        color_print(f"   ✘  Failed to download file: {url}", "red")
        return False


def json_patch_to_local_assets(json_data, project_id, screen_id, session):
    """
    Downloads files from URLs in the JSON data and updates the JSON with local file paths.

    Args:
        json_data (dict): JSON data containing URLs of files to be downloaded.
        project_id (str): ID of the project.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        dict: Updated JSON data with local file paths.
    """
    project_dir = os.path.join(DOCS_ROOT, "projects", str(project_id))
    os.makedirs(project_dir, exist_ok=True)

    avatars_dir = os.path.join(DOCS_ROOT, "common/avatars")
    os.makedirs(avatars_dir, exist_ok=True)

    if screen_id:
        screen_dir = os.path.join(
            DOCS_ROOT, "projects", str(project_id), "screens", str(screen_id)
        )
        os.makedirs(screen_dir, exist_ok=True)

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

                    # Screen versions (we save them in the screen dir under a versions dir)
                    if "versions/files" in dir_name:
                        file_path = os.path.join(screen_dir, "versions", file_name)

                    # Screens and thumbnails
                    elif (
                        "screens/thumbnails" in dir_name or "screens/files" in dir_name
                    ):
                        screen_id, file_extension = os.path.splitext(file_name)

                        if screen_id:
                            file_name = f"{'thumbnail' if 'thumbnails' in dir_name else 'image'}{file_extension}"
                            dir_name = f"screens/{screen_id}"

                        file_path = os.path.join(project_dir, dir_name, file_name)

                    # Project assets
                    else:
                        file_path = os.path.join(
                            project_dir, "assets", dir_name, file_name
                        )

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

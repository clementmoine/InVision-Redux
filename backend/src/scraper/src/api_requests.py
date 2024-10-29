import os
from bs4 import BeautifulSoup
from requests.exceptions import HTTPError, RequestException

from .utils import color_print
import time

max_retries = 3
cooldown = 120


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

    # response = session.post(url=url, headers=headers, data=data)
    response = request(session, "POST", url=url, headers=headers, data=data)

    if response and response.status_code == 200:
        # session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers)
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

    # response = session.get(url=url, headers=headers)
    response = request(session, "GET", url=url, headers=headers)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

        # response = session.post(url=url, headers=headers, data=data)
        response = request(session, "POST", url=url, headers=headers, data=data)
        response.raise_for_status()

        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

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

    # response = session.get(url=url, headers=headers, params=params)
    response = request(session, "GET", url=url, headers=headers, params=params)

    if response and response.status_code == 200:
        # if response.cookies:
        #     session.cookies.update(response.cookies)

        screen_history = response.json()

        return screen_history
    else:
        error_message = "Unknown error"
        if response:
            error_message = response.text

        color_print(f"Failed to fetch screen history: {error_message}", "red")
        return None

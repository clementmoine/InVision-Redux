
from bs4 import BeautifulSoup
from requests.exceptions import HTTPError

from src.utils import color_print

def get_user_id(session):
    url = 'https://projects.invisionapp.com/api:unifiedprojects.getProjects'
    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)
        
        user_id = response.json().get('account.id')

        return user_id
    else:
        color_print(f"Failed to get user id: {response.text}", 'red')
        return None

def fetch_tags(session):
    url = 'https://projects.invisionapp.com/api:unifiedprojects.getTags'
    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)
        
        tags = response.json().get('tags')

        return tags
    else:
        color_print(f"Failed to fetch tags: {response.text}", 'red')
        return None
    

def fetch_projects(session):
    url = 'https://projects.invisionapp.com/api:unifiedprojects.getProjects'
    params = {
        'isArchived': 'false',
        'isCollaborator': 'true'
    }
    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers, params=params)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)
        
        projects = response.json().get('results')

        return projects
    else:
        color_print(f"Failed to fetch projects: {response.text}", 'red')
        return None

def export_project(project, user_id, session):
    try:
        if project['type'] == 'prototype':
            url = f'https://projects.invisionapp.com/d/zipexport/generate/debugProjectID/{project["id"]}/debugUserID/{user_id}'
        elif project['type'] == 'board':
            url = 'https://projects.invisionapp.com/d/board_offline_zip_export/generate'
        else:
            color_print(f"Unknown project type: {project['type']}", 'red')
            return None

        headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}
        data = {
            'boardID': project['id'],
            'projectid': project['id'],
            'preventHotspotHinting': 'false',
            'preventBrowse': 'false',
            'preventBranding': 'true'
        }

        response = session.post(url=url, headers=headers, data=data)
        response.raise_for_status()

        if response.cookies:
            session.cookies.update(response.cookies)

        soup = BeautifulSoup(response.text, 'html.parser')

        if project['type'] == 'prototype':
            download_link_element = soup.find('a', class_='button export')
        else:
            download_link_element = soup.find('a', class_='download-box__button')

        if download_link_element:
            download_link = download_link_element.get('href')
            return download_link
        else:
            color_print(f"No download link found.", 'red')
            return None

    except HTTPError as http_err:
        color_print(f"HTTP error occurred during the request: {http_err}", 'red')
        return None
    except Exception as err:
        color_print(f"Error exporting the project: {err}", 'red')
        return None

def get_project_details(project, session):
    url = 'https://projects.invisionapp.com/api:desktop_partials.projectScreens2Grouped'
    params = {
        'id': project['id'],
    }

    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers, params=params)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)

        # Details includes groups and screens
        project_details = response.json()

        return project_details
    else:
        color_print(f"Failed to fetch projects details: {response.text}", 'red')
        return None

def get_screen_details(screen, session):
    url = 'https://projects.invisionapp.com/api:desktop_partials.consoleScreen'
    params = {
        'screenID': screen['id'],
        'trigger': 'navigation.screen' # Possible values: (navigation.mode, navigation.screen, initial-load, event.reload)
    }

    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers, params=params)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)

        # Screen details includes hotspots
        screen_details = response.json()

        return screen_details
    else:
        color_print(f"Failed to fetch screen details: {response.text}", 'red')
        return None

def get_project_assets(project, session):
    url = 'https://projects.invisionapp.com/api:inspect.getProjectAssets'
    params = {
        'projectID': project['id'],
    }

    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers, params=params)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)

        project_assets = response.json()

        return project_assets
    else:
        color_print(f"Failed to fetch screen inspect details: {response.text}", 'red')
        return None



def get_screen_inspect_details(screen, session):
    url = 'https://projects.invisionapp.com/api:inspect.getExtractionJSON'
    params = {
        'id': screen['id'],
    }

    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers, params=params)
    if response.status_code == 200:
        if response.cookies:
            session.cookies.update(response.cookies)

        # Inspect details includes layers
        screen_inspect_details = response.json()

        return screen_inspect_details
    else:
        color_print(f"Failed to fetch screen inspect details: {response.text}", 'red')
        return None

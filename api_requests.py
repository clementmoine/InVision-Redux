
from bs4 import BeautifulSoup
from requests.exceptions import HTTPError
from utils import color_print

def get_user_id(session):
    url = 'https://projects.invisionapp.com/api:unifiedprojects.getProjects'
    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.get(url=url, headers=headers)
    if response.status_code == 200:
        session.cookies.update(response.cookies)
        
        user_id = response.json().get('account.id')

        return user_id
    else:
        color_print(f"Failed to get user id: {response.text}", 'red')
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
            'preventBranding': 'false'
        }

        response = session.post(url=url, headers=headers, data=data)
        response.raise_for_status()

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

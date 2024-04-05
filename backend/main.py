import os
import requests
import dotenv

dotenv.load_dotenv()

# from src.download import download_project
from src.browse import browse_project
from src.utils import color_print, is_test_mode
from src.auth import login_classic, login_api
from src.api_requests import fetch_projects, get_user_id, fetch_tags


def main():
    email = os.getenv('INVISION_EMAIL')
    password = os.getenv('INVISION_PASSWORD')

    with requests.Session() as session:
        session.headers['x-client-type'] = 'App'
        session.headers['calling-service'] = 'auth-ui-browser'
        session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

        login_classic(email, password, session)

        login_api(email, password, session)
        
        # user_id = get_user_id(session)

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

if __name__ == "__main__":
    main()

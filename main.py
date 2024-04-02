import os
import requests
import dotenv
import concurrent.futures

dotenv.load_dotenv()

from utils import color_print, is_test_mode
from download import download_project
from auth import login_classic, login_api
from index_generator import generate_index_page
from api_requests import fetch_projects, get_user_id, fetch_tags


def main():
    email = os.getenv('INVISION_EMAIL')
    password = os.getenv('INVISION_PASSWORD')

    with requests.Session() as session:
        session.headers['x-client-type'] = 'App'
        session.headers['calling-service'] = 'auth-ui-browser'
        session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

        login_classic(email, password, session)

        login_api(email, password, session)
        
        user_id = get_user_id(session)

        #projects = fetch_projects(session)
        projects = [fetch_projects(session)[3]]


        projects = fetch_projects(session)
    
        # In test mode we process one project of each type
        if is_test_mode():
            color_print("╭────────────────────────────────────────────────────────────╮", "yellow")
            color_print("│ Test mode enabled: Fetching only one project of each type! │", "yellow")
            color_print("╰────────────────────────────────────────────────────────────╯", "yellow")

            projects = {project['type']: project for project in projects}.values()

        tags = fetch_tags(session)

        if projects:
            color_print(f"\nRetrieving {len(projects)} projects:", 'green')
            
            # List to store successfully exported projects
            successfully_exported_projects = []

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = []
                for project in projects:
                    project['data']['tags'] = []
                    for tag in tags:
                        if project['id'] in tag['prototypeIDs']:
                            project['data']['tags'].append(tag)

                    futures.append(executor.submit(download_project, project, user_id, session))
                    
                    for future in concurrent.futures.as_completed(futures):
                        result = future.result()
                        if result:
                            successfully_exported_projects.append(result)

            # Generate index page only for successfully exported projects
            if successfully_exported_projects:
                generate_index_page(successfully_exported_projects)

                # Compare the success to global list to find failed ones
                failed_projects = [project for project in projects if project not in successfully_exported_projects]
                
                if failed_projects:
                    color_print("\nSome projects failed to export.", 'red')
            else:
                color_print("\nNo projects were successfully exported.", 'red')
        else:
            color_print("\nNo projects were found.", 'red')

if __name__ == "__main__":
    main()

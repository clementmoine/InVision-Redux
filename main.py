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
            color_print("CAUTION: TEST_MODE enabled, processing only one project of each type.", "yellow")

            projects = {project['type']: project for project in projects}.values()

        tags = fetch_tags(session)

        if projects:
            color_print(f"\nRetrieving {len(projects)} projects:", 'green')

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = []
                for project in projects:
                    project['data']['tags'] = []
                    for tag in tags:
                        if project['id'] in tag['prototypeIDs']:
                            project['data']['tags'].append(tag)

                    futures.append(executor.submit(download_project, project, user_id, session))
                for future in concurrent.futures.as_completed(futures):
                    future.result()

            generate_index_page(projects)
        else:
            color_print("\nNo projects were found nor successfully exported.", 'red')

if __name__ == "__main__":
    main()

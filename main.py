import os
import requests
import dotenv
import concurrent.futures

from utils import color_print
from download import download_project
from auth import login_classic, login_api
from index_generator import generate_index_page
from api_requests import fetch_projects, get_user_id

dotenv.load_dotenv()

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

        projects = fetch_projects(session)

        if projects:
            color_print(f"Retrieving {len(projects)} projects...", 'green')

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = []
                for project in projects:
                    futures.append(executor.submit(download_project, project, user_id, session))
                for future in concurrent.futures.as_completed(futures):
                    future.result()

            generate_index_page(projects)
        else:
            color_print("No projects were found nor successfully exported.", 'red')

if __name__ == "__main__":
    main()

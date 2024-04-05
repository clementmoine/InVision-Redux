import os
import requests
from dotenv import load_dotenv


# from src.download import download_project
from src.browse import browse_projects
from src.api_requests import login_classic, login_api

load_dotenv()

def main():
    email = os.getenv('INVISION_EMAIL')
    password = os.getenv('INVISION_PASSWORD')

    with requests.Session() as session:
        session.headers['x-client-type'] = 'App'
        session.headers['calling-service'] = 'auth-ui-browser'
        session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

        login_classic(email, password, session)

        login_api(email, password, session)
        
        browse_projects(session)

if __name__ == "__main__":
    main()

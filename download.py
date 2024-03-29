import os
import shutil
import zipfile

from api_requests import export_project
from utils import color_print

def download_project(project, user_id, session):
    link = export_project(project, user_id, session)

    if link:
        export_folder = f"./docs/{project['id']}"
        os.makedirs(export_folder, exist_ok=True)

        # Name of the downloaded ZIP file
        zip_file_path = os.path.join(export_folder, f"{project['data']['name']}.zip")

        # Download the ZIP file
        with session.get(link, stream=True) as response:
            with open(zip_file_path, 'wb') as zip_file:
                shutil.copyfileobj(response.raw, zip_file)

        # Extract the contents of the ZIP file
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(export_folder)
            
        color_print(f"Project '{project['data']['name']}' successfully exported!", 'green')
    else:
        color_print(f"Failed to export project '{project['data']['name']}'.", 'red')

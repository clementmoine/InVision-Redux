import os
import json
import shutil
import zipfile

from src.utils import color_print
from src.api_requests import export_project

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

        # Create project.json
        project_json_path = os.path.join(export_folder, "project.json")
        with open(project_json_path, "w") as project_json_file:
            json.dump(project, project_json_file, indent=4)

        # Retrieve the thumbnail.png file
        thumbnail_url = project['data']['thumbnailUrl']
        if thumbnail_url:
            thumbnail_path = os.path.join(export_folder, "thumbnail.png")
            response = session.get(thumbnail_url, stream=True)
            if response.status_code == 200:
                with open(thumbnail_path, 'wb') as thumbnail_file:
                    shutil.copyfileobj(response.raw, thumbnail_file)

        color_print(f"  ⮑  '{project['data']['name']}' ({project['id']}): Successfully exported!", 'green')

        return project
    else:
        color_print(f"  ✘  '{project['data']['name']}' ({project['id']}): Failed to export!", 'red')

        return None

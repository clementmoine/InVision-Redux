import os
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.download import json_patch_to_local_assets, save_json_data
from src.utils import color_print, color_input, is_test_mode
from src.api_requests import fetch_projects, fetch_tags
from src.api_requests import (
    get_project_details,
    get_screen_details,
    get_screen_inspect_details,
)

# Constants for directories
DOCS_ROOT = os.path.join("../", os.getenv("DOCS_ROOT", "./docs"))


# Function to ask the user whether to overwrite, ignore, or cancel the operation
def ask_user():
    """
    Asks the user whether to overwrite, ignore, or cancel the operation if the docs folder already exists.

    Returns:
        str: 'overwrite' if the user wants to overwrite, 'ignore' if the user wants to ignore, 'cancel' to cancel the operation.
    """
    while True:
        response = (
            color_input(
                "Docs folder already exists. Do you want to overwrite it, ignore and continue, or cancel the operation? (overwrite/ignore/cancel): ",
                "yellow",
            )
            .strip()
            .lower()
        )

        if response in ("overwrite", "o"):
            return "overwrite"
        elif response in ("ignore", "i"):
            return "ignore"
        elif response in ("cancel", "c"):
            return "cancel"
        else:
            print(
                "Invalid input. Please enter 'overwrite' (o), 'ignore' (i), or 'cancel' (c)."
            )


# Remove the docs folder if it exists and handle user choice
if os.path.exists(DOCS_ROOT):
    user_choice = ask_user()
    if user_choice == "overwrite":
        shutil.rmtree(DOCS_ROOT, ignore_errors=True)
    elif user_choice == "ignore":
        color_print(
            "Existing docs folder will be ignored. Continuing operation.", "yellow"
        )
    else:  # user_choice == 'cancel'
        color_print("Operation cancelled. Exiting.", "yellow")
        exit()


def browse_screen(screen, project, session):
    """
    Browse a screen, download its assets, and save JSON data locally.

    Args:
        screen (dict): Screen data.
        project (dict): Project data.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        bool: True if the screen was successfully browsed or if the data already existed, False otherwise.
    """
    project_folder = os.path.join(DOCS_ROOT, "projects", str(project["id"]))
    screen_json_folder = os.path.join(
        project_folder, "assets/screens", str(screen["id"])
    )

    # Check if screen files exist
    file_names = ["screen.json", "inspect.json", "thumbnail.png", "image.png"]
    if all(
        map(
            lambda file_name: os.path.exists(
                os.path.join(screen_json_folder, file_name)
            ),
            file_names,
        )
    ):
        color_print(
            f"   ⮑  Screen {screen['name']} data already exists locally. Skipping.",
            "yellow",
        )

        return True

    screen_details = get_screen_details(screen, session)

    if screen_details:
        screen_details_patched = json_patch_to_local_assets(
            screen_details, project["id"], session
        )

        if not save_json_data(
            screen_details_patched, screen_json_folder, "screen.json"
        ):
            color_print(
                f"   ✘  Failed to save screen details for {screen['name']}", "red"
            )

            return False

        screen_inspect_details = get_screen_inspect_details(screen, session)

        if screen_inspect_details:
            screen_inspect_details_patched = json_patch_to_local_assets(
                screen_inspect_details, project["id"], session
            )

            if not save_json_data(
                screen_inspect_details_patched, screen_json_folder, "inspect.json"
            ):
                color_print(
                    f"   ✘  Failed to save inspect data for {screen['name']}", "red"
                )

                return False

            color_print(
                f"   ⮑  Screen {screen['name']} (details, inspect) gathered", "green"
            )

            return True

    color_print(f"   ✘  Failed to browse the screen {screen['name']}", "red")

    return False


def browse_project(project, session):
    """
    Browse a project, download its assets, and save JSON data locally.

    Args:
        project (dict): Project data.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        dict or None: Updated project data if successful, None otherwise.
    """
    color_print(f" • {project['data']['name']} ({project['id']}):", "white")

    project_folder = os.path.join(DOCS_ROOT, "projects", str(project["id"]))
    os.makedirs(project_folder, exist_ok=True)

    patched_project = json_patch_to_local_assets(project, project["id"], session)
    if not save_json_data(patched_project, project_folder, "project.json"):
        color_print(f"   ✘  Failed to save project data", "red")

        return False

    details = get_project_details(project, session)
    if details:
        archived_screens_count = details["archivedScreensCount"]
        screens_count = len(details["screens"])
        color_print(
            f"   ⮑  Project browsed ({screens_count} screens, {archived_screens_count} archived)",
            "green",
        )

        details_patched = json_patch_to_local_assets(details, project["id"], session)
        if not save_json_data(details_patched, project_folder, "screens.json"):
            color_print(f"   ✘  Failed to save screens data", "red")

            return False

        browsed_screen_ids = set()

        with ThreadPoolExecutor(max_workers=min(5, os.cpu_count())) as executor:
            future_to_screen_id = {
                executor.submit(browse_screen, screen, project, session): screen["id"]
                for screen in details.get("screens", [])
            }

            for future in as_completed(future_to_screen_id):
                screen_id = future_to_screen_id[future]
                try:
                    if future.result():
                        browsed_screen_ids.add(screen_id)
                except Exception as exc:
                    color_print(
                        f"   ✘  Screen {screen_id} generated an exception: {exc}", "red"
                    )

        if len(browsed_screen_ids) == screens_count:
            color_print(f"   ⮑  All screens browsed properly", "green")

            return True
        else:
            color_print(f"   ✘  Failed to browse some screens", "red")

            return False
    else:
        color_print(f"   ✘  Failed to browse the project", "red")

        return False


def browse_projects(session):
    projects = fetch_projects(session)

    if projects:
        # In test mode we process one project of each type
        if is_test_mode():
            color_print("╭───────────────────────────────────────────────╮", "yellow")
            color_print("│ Test mode enabled: Fetching only one project! │", "yellow")
            color_print("╰───────────────────────────────────────────────╯", "yellow")

            projects = {project["type"]: project for project in projects}.values()

        # WIP : Only manage prototypes
        projects = [project for project in projects if project["type"] == "prototype"]

        color_print(f"\nRetrieving {len(projects)} projects:", "green")

        tags = fetch_tags(session)
        if not save_json_data(tags, os.path.join(DOCS_ROOT, "common"), "tags.json"):
            color_print(f" ✘  Failed to save tags data", "red")

            return False

        successfully_exported_project_ids = set()

        for project in projects:
            if tags:
                project["data"]["tags"] = [
                    tag for tag in tags if project["id"] in tag["prototypeIDs"]
                ]

            if browse_project(project, session):
                successfully_exported_project_ids.add(project["id"])

        #  Generate index page only for successfully exported projects
        successfully_exported_projects = [
            project
            for project in projects
            if project["id"] in successfully_exported_project_ids
        ]
        if successfully_exported_projects:
            # Compare the success to global list to find failed ones
            failed_projects = [
                project
                for project in projects
                if project not in successfully_exported_projects
            ]

            if failed_projects:
                color_print("\nSome projects failed to export.", "red")

                return False
            else:
                color_print("\nAll projects were successfully exported.", "yellow")

                return True
        else:
            color_print("\nNo projects were successfully exported.", "red")

            return False
    else:
        color_print("\nNo projects were found.", "red")

        return False

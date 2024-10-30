import json
import os
import shutil
from pathlib import Path
from requests import Session
from concurrent.futures import ThreadPoolExecutor, as_completed
from .utils import color_print, is_test_mode
from .api_requests import (
    fetch_tags,
    fetch_projects,
    fetch_project_shares,
    get_screen_history,
    get_screen_details,
    get_project_screens,
    get_screen_inspect_details,
    get_project_archived_screens,
    json_patch_to_local_assets,
    save_json_data,
)

# Constants for directories
DOCS_ROOT = os.getenv("DOCS_ROOT", "./docs")


# Parallelized tasks
PARALLELIZED_TASKS = min(5, os.cpu_count())

# Ignore Archived project
IGNORE_ARCHIVED_PROJECTS = False


def is_valid_response(response, expected_keys):
    if not response or not isinstance(response, dict):
        return False
    return all(key in response for key in expected_keys)


def browse_screen(screen, project, session: Session):
    """
    Browse a screen, download its assets, and save JSON data locally.

    Args:
        screen (dict): Screen data.
        project (dict): Project data.
        session (requests.Session): Session object for making HTTP requests.

    Returns:
        bool: True if the screen was successfully browsed or if the data already existed, False otherwise.
    """
    project_folder = Path(DOCS_ROOT) / "projects" / str(project["id"])
    screen_folder = project_folder / "screens" / str(screen["id"])

    # Files we expect to see when the screen already exists
    file_names = [
        "inspect.json",  # Not existing for archived screen
        "history.json",  # Not existing either on archived screen
        "screen.json",
    ]

    try:
        screen_folder.mkdir(parents=True, exist_ok=True)

        # Remove inspect.json to expected files if the screen is archived
        if screen.get("isArchived", False):
            file_names.remove("history.json")
            file_names.remove("inspect.json")

        # Check if any image file exists (versions images doesn't exists everytime so we don't check here)
        image_files = list(screen_folder.glob("image.*"))
        thumbnail_files = list(screen_folder.glob("thumbnail.*"))

        versions_folder = screen_folder / "versions"
        history_json_path = screen_folder / "history.json"

        version_count = 0
        excepted_version_count = 0

        if not screen.get("isArchived", False):
            if versions_folder.exists():
                version_count = len(list(versions_folder.iterdir())) + 1

            if history_json_path.exists() and history_json_path.stat().st_size > 0:
                with history_json_path.open("r") as f:
                    excepted_version_count = len(json.load(f).get("versions", []))

        if (
            len(image_files) >= 1
            and len(thumbnail_files) >= 1
            and (screen.get("isArchived") or version_count == excepted_version_count)
            and all(
                (Path(screen_folder / file_name).exists() for file_name in file_names)
            )
        ):
            color_print(
                f"   ⮑  Screen {screen['id']} data already exists locally. Skipping.",
                "yellow",
            )

            return True

        screen_details = get_screen_details(screen, session)

        if screen_details:
            screen_details_patched = json_patch_to_local_assets(
                screen_details, project["id"], screen["id"], session
            )

            if not save_json_data(screen_details_patched, screen_folder, "screen.json"):
                color_print(
                    f"   ✘  Failed to save screen details for {screen['id']}", "red"
                )

                return False

            if screen["isArchived"]:
                color_print(
                    f"   ⮑  Archived screen {screen['id']} (details) gathered", "green"
                )
                return True

            screen_inspect_details = get_screen_inspect_details(screen, session)

            if screen_inspect_details:
                screen_inspect_details_patched = json_patch_to_local_assets(
                    screen_inspect_details, project["id"], screen["id"], session
                )

                if not save_json_data(
                    screen_inspect_details_patched, screen_folder, "inspect.json"
                ):
                    color_print(
                        f"   ✘  Failed to save inspect data for {screen['id']}", "red"
                    )

                    return False

            screen_history = get_screen_history(screen, session)

            if screen_history:
                screen_history_patched = json_patch_to_local_assets(
                    screen_history, project["id"], screen["id"], session
                )

                if not save_json_data(
                    screen_history_patched, screen_folder, "history.json"
                ):
                    color_print(
                        f"   ✘  Failed to save history data for {screen['id']}", "red"
                    )

                    return False

                color_print(
                    f"   ⮑  Screen {screen['id']} (details, inspect, history) gathered",
                    "green",
                )
                return True

    except Exception as e:
        color_print(f"   ✘  Failed to browse the screen {screen['id']}: {e}", "red")

        return False

    color_print(f"   ✘  Failed to browse the screen {screen['id']}", "red")
    return False


def browse_project(project, ignored_project_ids, option, session: Session):
    """
    Browse a project, download its assets, and save JSON data locally.

    Args:
        project (dict): Project data.
        session (requests.Session: Session): Session object for making HTTP requests.

    Returns:
        dict or None: Updated project data if successful, None otherwise.
    """
    project_folder = Path(DOCS_ROOT) / "projects" / str(project["id"])

    project_folder.mkdir(parents=True, exist_ok=True)

    patched_project = json_patch_to_local_assets(project, project["id"], None, session)
    if not save_json_data(patched_project, project_folder, "project.json"):
        color_print(f"   ✘  Failed to save project data", "red")

        return False

    shares = fetch_project_shares(project, session)
    if shares:
        shares_json_path = project_folder / "shares.json"

        # Load local shares.json if it exists
        if shares_json_path.exists():
            if shares_json_path.stat().st_size > 0:
                try:
                    with shares_json_path.open("r") as f:
                        local_shares_data = json.load(f)

                except json.JSONDecodeError:
                    local_shares_data = {}
            else:
                local_shares_data = {}
        else:
            local_shares_data = {}

        # Check if shares have changed
        shares_changed = len(shares.get("shares", [])) != len(
            local_shares_data.get("shares", [])
        ) or any(
            share["id"] != local_share.get("id")
            for share, local_share in zip(
                shares.get("shares", []), local_shares_data.get("shares", [])
            )
        )

        if shares_changed:
            # Save the new shares to shares.json
            if not save_json_data(shares, project_folder, "shares.json"):
                color_print(f"   ✘  Failed to save shares data", "red")
            else:
                color_print(f"   ⮑  Shares data updated", "green")
    else:
        color_print(
            f"   ✘  Failed to fetch shares for {project['data']['name']}", "red"
        )

    screens = get_project_screens(project, session)
    if screens:
        archived_screens_count = screens.get("archivedScreensCount")

        if archived_screens_count != 0:
            screens["archivedscreens"] = get_project_archived_screens(
                project, session
            ).get("archivedscreens", [])

        screens_count = len(screens["screens"])
        color_print(
            f"   ⮑  Project browsed ({screens_count} screens, {archived_screens_count} archived)",
            "green",
        )

        screens_json_path = project_folder / "screens.json"

        # Check if the screens are up to date
        if option == "update" and screens_json_path.exists():
            with screens_json_path.open("r") as f:
                local_screens_data = json.load(f)

            screens_to_delete = []

            # Check each "updatedAt", "conversationCount", "imageVersion" and "unreadConversationCount" from screens.json
            for screen, local_screen in zip(
                screens.get("screens", []), local_screens_data.get("screens", [])
            ):
                if (
                    screen["updatedAt"] != local_screen.get("updatedAt")
                    or screen["imageVersion"] != local_screen.get("imageVersion")
                    or screen.get("conversationCount", 0)
                    != local_screen.get("conversationCount", 0)
                    or screen.get("unreadConversationCount", 0)
                    != local_screen.get("unreadConversationCount", 0)
                ):
                    # Add to list of screens to delete if data is not up to date
                    screens_to_delete.append(screen)

            for archived_screen, local_archived_screen in zip(
                screens.get("archivedscreens", []),
                local_screens_data.get("archivedscreens", []),
            ):
                if archived_screen.get("updatedAt") != local_archived_screen.get(
                    "updatedAt"
                ):
                    screens_to_delete.append(archived_screen)

            # Remove outdated screens folders
            for screen in screens_to_delete:
                screen_folder = project_folder / "screens" / str(screen["id"])

                if screen_folder.exists():
                    shutil.rmtree(screen_folder, ignore_errors=True)
                    color_print(
                        f"   ⮑  Screen {screen['id']} folder deleted for update",
                        "yellow",
                    )

        screens_patched = json_patch_to_local_assets(
            screens, project["id"], None, session
        )
        if not save_json_data(screens_patched, project_folder, "screens.json"):
            color_print(f"   ✘  Failed to save screens data", "red")

            return False

        if project["data"].get("isArchived", False):
            color_print(
                f"   ⮑  ⚠️ Screens details can't be gathered on archived projects",
                "red",
            )
            return True

        browsed_screen_ids = set()

        with ThreadPoolExecutor(max_workers=PARALLELIZED_TASKS) as executor:
            future_to_screen_id = {
                executor.submit(browse_screen, screen, project, session): screen["id"]
                for screen in (
                    screens.get("screens", []) + screens.get("archivedscreens", [])
                )
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

        if len(browsed_screen_ids) == screens_count + archived_screens_count:
            color_print(f"   ⮑  All screens browsed properly", "green")

            return True
        else:
            color_print(f"   ✘  Failed to browse some screens", "red")

            return False
    else:
        color_print(f"   ✘  Failed to browse the project", "red")

        return False


def browse_projects(session: Session, option=None):
    projects = fetch_projects(isArchived=False, isCollaborator=True, session=session)

    archivedProjects = (
        fetch_projects(isArchived=True, isCollaborator=True, session=session)
        if not IGNORE_ARCHIVED_PROJECTS
        else []
    )

    allProjects = (projects or []) + (archivedProjects or [])

    if allProjects:
        # In test mode we process one project of each type
        if is_test_mode():
            color_print("╭───────────────────────────────────────────────╮", "yellow")
            color_print("│ Test mode enabled: Fetching only one project! │", "yellow")
            color_print("╰───────────────────────────────────────────────╯", "yellow")

            allProjects = {project["type"]: project for project in allProjects}.values()

        # WIP : Only manage prototypes
        allProjects = [
            project for project in allProjects if project["type"] == "prototype"
        ]

        color_print(f"\nMaximum tasks parallelized: {PARALLELIZED_TASKS}", "green")
        color_print(f"\nRetrieving {len(allProjects)} projects:", "green")

        tags = fetch_tags(session)
        common_folder = Path(DOCS_ROOT) / "common"
        if not save_json_data(tags, common_folder, "tags.json"):
            color_print(f" ✘  Failed to save tags data", "red")

            return False

        successfully_exported_project_ids = set()
        ignored_project_ids = set()

        for project in allProjects:
            color_print(f" • {project['data']['name']} ({project['id']}):", "white")

            project_folder = Path(DOCS_ROOT) / "projects" / str(project["id"])

            # Ignore existing valid project folders
            if option == "update" and project_folder.exists():
                required_files = ["project.json", "screens.json"]
                if all((project_folder / f).exists() for f in required_files):
                    # Grab the project updated date from the project and project.json
                    # Grab the projet item count from the project and project.json
                    # If they match ignore the project, if they don't remove the project dir to scrap that again
                    project_update_date = project["data"].get("updatedAt")
                    project_item_count = project["data"].get("itemCount")

                    project_json_path = project_folder / "project.json"

                    with project_json_path.open("r") as f:
                        local_project_data = json.load(f)

                    # Protect the local data if the response is invalid
                    if not is_valid_response(
                        local_project_data,
                        [
                            "id",
                            "data",
                            "type",
                        ],
                    ):
                        color_print(
                            f"   ⮑  Project skipped due to invalid response",
                            "yellow",
                        )

                        ignored_project_ids.add(project["id"])
                        continue

                    local_project_update_date = local_project_data["data"].get(
                        "updatedAt"
                    )
                    local_project_item_count = local_project_data["data"].get(
                        "itemCount"
                    )

                    # Project outdated
                    if (
                        project_update_date != local_project_update_date
                        or project_item_count != local_project_item_count
                    ):
                        color_print(
                            f"   ⮑  Project outdated, replay the scraping...",
                            "yellow",
                        )
                        shutil.rmtree(project_folder, ignore_errors=True)

            if tags:
                project["data"]["tags"] = [
                    tag for tag in tags if project["id"] in tag["prototypeIDs"]
                ]

            if browse_project(project, ignored_project_ids, option, session):
                successfully_exported_project_ids.add(project["id"])

        # Compare the success and ignored to global list to find failed ones
        failed_project_ids = [
            project["id"]
            for project in allProjects
            if project["id"] not in successfully_exported_project_ids
            and project["id"] not in ignored_project_ids
        ]

        # Ignored projects
        if len(ignored_project_ids) > 0:
            if len(allProjects) == len(ignored_project_ids):
                color_print(
                    f"\nAll {len(allProjects)} projects were already up-to-date and get ignored.",
                    "green",
                )
            else:
                color_print(
                    f"\nIgnored {len(ignored_project_ids)} existing projects.", "yellow"
                )

        # Successfully exported projects
        if len(successfully_exported_project_ids) > 0:
            if len(allProjects) == len(successfully_exported_project_ids):
                color_print(
                    f"\nAll {len(successfully_exported_project_ids)} projects were successfully exported.",
                    "green",
                )
            else:
                color_print(
                    f"\nSuccessfully exported {len(successfully_exported_project_ids)} projects.",
                    "green",
                )

        if len(failed_project_ids) > 0:
            if len(allProjects) == len(failed_project_ids):
                color_print(
                    f"\nAll {len(failed_project_ids)} projects failed to export", "red"
                )
            else:
                color_print(
                    f"\n{len(failed_project_ids)} projects failed to export.", "red"
                )

            return False

    else:
        color_print("\nNo projects were found.", "red")

        return False

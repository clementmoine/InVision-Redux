import os
import sys
import shutil
import requests
from pathlib import Path
from dotenv import load_dotenv

from .src.browse import browse_projects
from .src.utils import color_print
from .src.api_requests import login_classic, login_api

load_dotenv()

# Constants for directories
DOCS_ROOT = os.getenv("DOCS_ROOT", "./docs")


def run_scraper(option=None):
    # Validate if DOCS_ROOT exists, is not empty, and no valid option is provided
    if (
        Path(DOCS_ROOT).exists()
        and Path(DOCS_ROOT).is_dir()
        and any(Path(DOCS_ROOT).iterdir())
        and (not option or option not in ["overwrite", "update"])
    ):
        color_print(
            f"Docs folder already exists. Expected 'overwrite' or 'update' option.",
            "red",
        )
        raise ValueError(
            f"Docs folder already exists. Expected 'overwrite' or 'update' option."
        )

    # Email and password for scraping
    email = os.getenv("INVISION_EMAIL")
    password = os.getenv("INVISION_PASSWORD")

    # Setup session
    with requests.Session() as session:
        session.headers["x-client-type"] = "App"
        session.headers["calling-service"] = "auth-ui-browser"
        session.headers["User-Agent"] = (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )

        # Authenticate
        login_classic(email, password, session)
        login_api(email, password, session)

        # If the option is invalid
        if option is not None and option not in ["update", "overwrite"]:
            color_print(
                f"Invalid option '{option}'. Expected 'overwrite' or 'update'.", "red"
            )
            raise ValueError(
                f"Invalid option '{option}'. Expected 'overwrite' or 'update'."
            )

        # Handle 'overwrite' option
        if option == "overwrite":
            shutil.rmtree(DOCS_ROOT, ignore_errors=True)
            color_print(
                "Existing docs folder removed. Replaying the scraping.", "yellow"
            )

        # Handle 'update' option
        elif option == "update":
            color_print(
                "Existing files in folders will be ignored. Replaying the scraping.",
                "yellow",
            )

        # Start scraping
        browse_projects(session, option)


if __name__ == "__main__":
    # Setup the CA if needed
    if os.getenv("CUSTOM_CA_FILE"):
        ca_file = os.path.join(
            "/usr/local/share/ca-certificates", os.getenv("CUSTOM_CA_FILE")
        )

        if os.path.isfile(ca_file):
            os.environ["CURL_CA_BUNDLE"] = ca_file
            os.environ["REQUESTS_CA_BUNDLE"] = ca_file

    # Get the option from CLI arguments or None if not provided
    option = sys.argv[1] if len(sys.argv) > 1 else None
    run_scraper(option)

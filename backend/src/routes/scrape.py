from flask import Blueprint, request, jsonify
from enum import Enum
from src.scraper.main import run_scraper

blueprint = Blueprint("scrape", __name__)

is_already_running = False


class Option(Enum):
    UPDATE = "update"
    OVERWRITE = "overwrite"


@blueprint.route("/scrape", methods=["GET"])
@blueprint.route("/scrape/<string:option>", methods=["GET"])
def scrape(option=None):
    global is_already_running

    if is_already_running:
        return jsonify({"error": "Scraping is already running"}), 200

    # Determine option from URL parameter if not provided as a path segment
    query_option = request.args.get("option")

    if query_option:
        try:
            option_enum = Option(query_option)
            option = option_enum.value
        except ValueError:
            return (
                jsonify({"error": "Invalid option. Use 'update' or 'overwrite'."}),
                400,
            )
    elif option:
        try:
            option_enum = Option(option)
            option = option_enum.value
        except ValueError:
            return (
                jsonify({"error": "Invalid option. Use 'update' or 'overwrite'."}),
                400,
            )
    else:
        option = None

    try:
        is_already_running = True
        run_scraper(option=option)
        return jsonify({"message": "Docs processed successfully"}), 200
    except Exception as e:
        # Log the error and return it in the response
        print(f"Error occurred: {e}")  # Ensure this shows in the container logs
        return jsonify({"error": str(e)}), 500
    finally:
        is_already_running = False

import json
from bs4 import BeautifulSoup, formatter

from src.utils import color_print

def generate_index_page(projects):
    # Path of the template file and the generated index.html file
    template_file_path = "./index_template.html"
    index_file_path = "./docs/index.html"

    # Path of the generated index.json file
    index_json_path = "./docs/index.json"

    # Read the content of the template file
    with open(template_file_path, "r") as template_file:
        template_content = template_file.read()

    # Generate a string containing the project entries
    project_entries = ""
    projects_info=[]

    for project in projects:
        project_name = project['data']['name']
        project_id = project['id']

        index_url = f"./{project_id}/index.html"
        thumbnail_url = f"./{project_id}/thumbnail.png"

        project_tags = [{key: value for key, value in tag.items() if key != 'prototypeIDs'} for tag in project['data'].get('tags', [])]

        # Append the project entry with the image, name, and link
        project_entries += (
            "<li>"
                f"<a href='{index_url}'>"
                    "<figure>"
                        f"<img src='{thumbnail_url}' alt='{project_name}'>"
                        f"<figcaption>{project_name}</figcaption>"
                    "</figure>"
                "</a>"
            "</li>"
        )

        # Append project information to the list
        projects_info.append({
            "name": project_name,
            "id": project_id,
            "thumbnail_url": thumbnail_url,
            "tags": project_tags
        })

    # Insert the project entries into the template and format
    html_content = template_content.replace("<!-- Insert project items here -->", project_entries)
    formatted_html = BeautifulSoup(html_content, 'html.parser').prettify(formatter=formatter.HTMLFormatter(indent=4))

    # Write the HTML content to the index.html file
    with open(index_file_path, "w") as index_file:
        index_file.write(formatted_html)

    # Write project information to the index.json file
    with open(index_json_path, "w") as index_json_file:
        json.dump(projects_info, index_json_file, indent=4)


    color_print(f"\nIndex page generated: {index_file_path}", 'yellow')

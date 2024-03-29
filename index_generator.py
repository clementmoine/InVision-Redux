from utils import color_print

def generate_index_page(projects):
    # Path of the template file and the generated index.html file
    template_file_path = "./index_template.html"
    index_file_path = "./docs/index.html"

    # Read the content of the template file
    with open(template_file_path, "r") as template_file:
        template_content = template_file.read()

    # Generate a string containing the project entries
    project_entries = ""
    for project in projects:
        project_entries += f"<li><a href='./{project['id']}/index.html'>{project['data']['name']}</a></li>"

    # Insert the project entries into the template
    html_content = template_content.replace("<!-- Insert project items here -->", project_entries)

    # Write the HTML content to the index.html file
    with open(index_file_path, "w") as index_file:
        index_file.write(html_content)

    color_print(f"Index page generated: {index_file_path}", 'yellow')

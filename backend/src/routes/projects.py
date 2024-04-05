from flask import Blueprint

blueprint = Blueprint('projects', __name__)

@blueprint.route('/projects')
def get_projects():
    return 'Liste des projets'

@blueprint.route('/projects/<int:project_id>')
def get_project(project_id):
    return f'Détails du projet {project_id}'
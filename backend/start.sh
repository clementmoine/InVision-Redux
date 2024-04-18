ln -s ../../docs ./src/static
export FLASK_APP=src/app:app
poetry run flask run --host 0.0.0.0 --port 8080 --debug
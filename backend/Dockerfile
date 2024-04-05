FROM python:3.12

WORKDIR /srv

# Install poetry
RUN pip install --upgrade pip
RUN pip install poetry

# Install Python dependencies
ADD pyproject.toml poetry.lock ./
RUN poetry install

# Add the project
# NOTE Run the install again to install the project
ADD src ./src
RUN poetry install

# Set the default command
ENV FLASK_APP src/app:app
CMD poetry run flask run --host 0.0.0.0 --port 8080 --debug
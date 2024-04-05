# Install Poetry and create .env file
install:
	curl -sSL https://install.python-poetry.org | python3 -
	poetry --version || (echo "Poetry installation failed"; exit 1)
	@echo "Creating .env file..."
	@echo "INVISION_EMAIL=your_email@example.com" > .env
	@echo "INVISION_PASSWORD=your_password" >> .env
	@echo "TEST_MODE=0" >> .env
	@echo "DOCS_ROOT=\$${ROOT:-.}/docs" >> .env
	@echo ".env file created successfully."

# Install dependencies and run scraper
scrape:
	cd scraper && poetry install && poetry run python main.py

# Start backend and frontend services
start-backend:
	docker compose up -d backend || (echo "Failed to start backend service"; exit 1)

start-frontend:
	docker compose up -d frontend || (echo "Failed to start frontend service"; exit 1)

# Stop backend and frontend services
stop-backend:
	docker compose down backend

stop-frontend:
	docker compose down frontend

# Open browser at localhost:3000
open-browser:
	@echo "Opening browser on http://localhost:3000"
	open http://localhost:3000

# Start both backend and frontend services and open browser
start: install start-backend start-frontend open-browser

# Stop both backend and frontend services
stop: stop-backend stop-frontend

# Install Poetry and create .env file
install:
	curl -sSL https://install.python-poetry.org | python3 -
	poetry --version || (echo "Poetry installation failed"; exit 1)
	@echo "Creating .env file..."
	@echo "INVISION_EMAIL=your_email@example.com" > .env
	@echo "INVISION_PASSWORD=your_password" >> .env
	@echo "TEST_MODE=0" >> .env
	@echo "DOCS_ROOT=/app/backend/src/static/docs" >> .env
	@echo ".env file created successfully."


# Open browser at localhost:3000
open-browser:
	@echo "Opening browser on http://localhost:3000"
	open http://localhost:3000

# Run in dev mode
dev:
	docker compose -f docker-compose.yml up --build -d
	$(MAKE) open-browser

# Run in production mode
prod:
	docker compose -f docker-compose.prod.yml up --build -d

# Stop all
stop:
	docker compose down

# Scrape from CLI
scrape:
	docker exec invision-backend poetry run python -m src.scraper.main
	
# Scrape with 'update' option
scrape-update:
	docker exec invision-backend poetry run python -m src.scraper.main update

# Scrape with 'overwrite' option
scrape-overwrite:
	docker exec invision-backend poetry run python -m src.scraper.main overwrite

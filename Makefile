# Create .env file
install:
	@echo "Creating .env file..."
	@echo "INVISION_EMAIL=your_email@example.com" > .env
	@echo "INVISION_PASSWORD=your_password" >> .env
	@echo "TEST_MODE=0" >> .env
	@echo "ROOT=." >> .env
	@echo "DOCS_ROOT=/backend/src/static/docs" >> .env
	@echo "" >> .env
	@echo "#PROD_PORT=80" >> .env
	@echo "" >> .env
	@echo "#CUSTOM_CA_FILE=custom.ca-bundle.crt" >> .env
	@echo "" >> .env
	@echo "#PYTHON_REGISTY_URL=http://nexus/repository/pypi/simple" >> .env
	@echo "" >> .env
	@echo "#NPM_REGISTRY_SERVER=http://nexus/repository/npm-group" >> .env
	@echo ".env file created successfully."

# Open browser at localhost:3000
open-browser:
	@echo "Opening browser on http://localhost:3000"
	open http://localhost:3000

# Run in dev mode
dev:
	docker compose build
	docker compose up -d
	$(MAKE) open-browser

# Run in production mode
prod:
	docker compose -f compose.prod.yml build
	docker compose -f compose.prod.yml up -d

# Stop all
stop:
	docker compose down

# Scrape from CLI
scrape:
	docker exec backend poetry run python -m src.scraper.main
	
# Scrape with 'update' option
scrape-update:
	docker exec backend poetry run python -m src.scraper.main update

# Scrape with 'overwrite' option
scrape-overwrite:
	docker exec backend poetry run python -m src.scraper.main overwrite

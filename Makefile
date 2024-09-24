# Create .env file
install:
	@echo "Creating .env file..."
	@echo "INVISION_EMAIL=your_email@example.com" > .env
	@echo "INVISION_PASSWORD=your_password" >> .env
	@echo "TEST_MODE=0" >> .env
	@echo "ROOT=." >> .env
	@echo "DOCS_ROOT=/backend/src/static/docs" >> .env
	@echo "" >> .env
	@echo "#CURL_CA_BUNDLE=/ca.crt" >> .env
	@echo "" >> .env
	@echo "#PIP_CERT=/ca.crt" >> .env
	@echo "#PIP_INDEX_URL=http://example.fr" >> .env
	@echo "" >> .env
	@echo "#POETRY_CERTIFICATES_CUSTOM_CERT=/ca.crt" >> .env
	@echo "#POETRY_CUSTOM_SOURCE_URL=http://example.fr" >> .env
	@echo "" >> .env
	@echo "#YARN_CAFILE=/ca.crt" >> .env
	@echo "#YARN_REGISTRY=http://example.fr" >> .env
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

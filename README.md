# InVision Export

InVision Export is a Python script designed to help users export their projects from InVision before its closure in December 2024. With this tool, users can retrieve all their projects and preserve the prototypes along with their hotspots.

## Getting Started

To begin using InVision Export, follow these steps:

1. **Clone the Repository**:
   ```
   git clone https://github.com/clementmoine/InVision-Export.git
   ```

2. **Navigate to the Project Directory**:
   ```
   cd InVision-Export
   ```

3. **Install Dependencies and Set Up Environment**:
   Run the following command to install dependencies and set up the environment:
   ```
   make install
   ```

4. **Edit the .env File**:
   The `.env` file is automatically generated during installation. Open the `.env` file located in the root directory of the project and add your InVision email and password in the following format:
   ```
   INVISION_EMAIL=your_email@example.com
   INVISION_PASSWORD=your_password
   ```
   You can also modify other settings as needed.

5. **Run the Scraper**:
   Execute the scraper to generate the necessary documentation files:
   ```
   make scrape
   ```

6. **Review the Exported Projects**:
   Once the scraper has finished running, you can find the exported projects in the `docs` directory. To start the frontend and backend containers serving the documentation:
   ```
   make start
   ```

7. **Stop the Project**:
   To stop the containers, you can run:
   ```
   make stop
   ```

## Debugging and Testing

By default, InVision Export processes all projects available in your InVision account. However, you can enable a test mode to process only a single project of each type. To enable the test mode, set the `TEST_MODE` environment variable to `True` or `1` in your `.env` file. This can be useful for testing and debugging purposes.

## Note

Please note that InVision Export is an independent tool developed to assist users in exporting their projects before the closure of InVision's services. It is not affiliated with InVision.
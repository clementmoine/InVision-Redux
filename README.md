# Invision Export

Invision Export is a Python script designed to help users export their projects from Invision before its closure in December 2024. With this tool, you can retrieve all your projects and preserve the prototypes with their hotspots.

## Getting Started

To get started with Invision Export, follow these steps:

1. **Install Pipenv**:
   If you don't have Pipenv installed, you can do so by following the instructions [here](https://pipenv.pypa.io/en/latest/installation.html).

2. **Clone the Repository**:
   ```
   git clone https://github.com/clementmoine/InVision-Export.git
   ```

3. **Navigate to the Project Directory**:
   ```
   cd InVision-Export
   ```

4. **Create a .env File**:
   Create a `.env` file in the root directory of the project and add your InVision email and password in the following format:
   ```
   INVISION_EMAIL=your_email@example.com
   INVISION_PASSWORD=your_password
   ```

5. **Install Dependencies**:
   ```
   pipenv install
   ```

6. **Run the Script**:
   ```
   pipenv run python main.py
   ```

7. **Review the Exported Projects**:
   Once the script finishes running, you can find the exported projects in the `docs` directory, running the `index.html` in your browser or in a web server you will retrieve the complete index of your projects.

## Debug / Test

By default, Invision Export processes all projects available in your Invision account. However, you can enable a test mode to process only a single project of each type. To enable the test mode, set the `TEST_MODE` environment variable to `True` or `1` in your `.env` file. This can be useful for testing and debugging purposes.

## Note
Please note that InVision Export is not affiliated with InVision. It is an independent tool developed to assist users in exporting their projects before the closure of InVision's services.
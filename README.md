# Python Web-Based Linux Package Manager

This project is a web-based interface for managing packages on Linux servers. It uses Python (Flask) for the backend and simple HTML/JavaScript for the frontend.

## Features

- Displays information about the host Linux distribution.
- Allows searching for packages.
- Allows installing packages.
- Allows removing packages.
- Allows updating the package database.
- Allows listing installed packages.
- Aims to support various Linux distributions by dynamically using their native package managers.

## Setup and Running

1.  **Clone the repository (if applicable) or ensure all files are in a directory.**

2.  **Create a Python virtual environment (recommended):**
    This project requires Python 3.5 or newer. The application has been adjusted to ensure compatibility with versions that do not support certain newer features of the `subprocess` module.
    ```bash
    python3 -m venv venv  # Ensure your python3 points to version 3.5 or higher
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask application:**
    ```bash
    python app.py
    ```
    The application will typically be available at `http://0.0.0.0:5000` or `http://localhost:5000` in your web browser.

    **Note:** For package installation and removal, the application executes commands using `sudo`. The user running the Flask application must have passwordless `sudo` privileges for the respective package manager commands, or the commands will fail (or hang waiting for a password if `sudo` is not configured for passwordless operation for that user and command). This is a security consideration and should be configured carefully in a production environment.

## Basic Testing Strategy

This application interacts directly with the system's package manager. Testing should be performed carefully, especially on production systems.

### 1. API Endpoint Testing (Manual)

You can test the API endpoints using `curl` or a tool like Postman. The Flask application must be running.

-   **Get Distribution Info:**
    ```bash
    curl http://localhost:5000/api/distro
    ```

-   **Search for a package (e.g., htop):**
    ```bash
    curl http://localhost:5000/api/packages/search/htop
    ```

-   **Install a package (e.g., htop):** (Use a safe, small package for testing)
    ```bash
    curl -X POST http://localhost:5000/api/packages/install/htop
    ```

-   **List installed packages:**
    ```bash
    curl http://localhost:5000/api/packages/list
    ```
    *(Verify `htop` is listed if installed)*

-   **Remove a package (e.g., htop):**
    ```bash
    curl -X POST http://localhost:5000/api/packages/remove/htop
    ```

-   **Update package database:**
    ```bash
    curl -X POST http://localhost:5000/api/packages/update
    ```

### 2. Web Interface Testing

Access the web interface (e.g., `http://localhost:5000`) in a browser and test the following functionalities:

-   **Distribution Information:** Verify that the correct distribution details are displayed on page load.
-   **Search Package:** Enter a package name (e.g., `sl`, `htop`, `mc`) and click "Search". Verify output.
-   **Install Package:** Enter a package name (e.g., `sl`) and click "Install". Verify the output indicates success and the package becomes available.
-   **Remove Package:** Enter the name of the package you installed (e.g., `sl`) and click "Remove". Verify the output indicates success.
-   **Update Package Database:** Click the "Update Package Database" button. Verify output.
-   **List Installed Packages:** Click the "List Installed Packages" button. Verify output.

### 3. Cross-Distribution Testing (Manual)

If possible, run this application on different Linux distributions to test compatibility. Key distributions to consider:

-   Debian-based (Ubuntu, Debian, Linux Mint)
-   RPM-based (Fedora, CentOS, RHEL, openSUSE)
-   Arch-based (Arch Linux, Manjaro)

**What to look for during cross-distribution testing:**

-   Correct identification of the distribution.
-   Successful execution of all package operations (search, install, remove, list, update_db).
-   Correct parsing of command outputs (though the current version mostly passes raw output).

### Important Considerations:

-   **`sudo` Configuration:** Operations like install, remove, and update_db require `sudo`. The application assumes the user running it has the necessary `sudo` privileges without needing a password prompt for the specific package manager commands. Misconfiguration can lead to failures or security risks.
-   **Package Name Variations:** Package names can sometimes differ slightly between distributions.
-   **Command Output Parsing:** The current version does minimal parsing of the output from package manager commands. A more advanced version might need more sophisticated parsing to provide structured data.
-   **Error Handling:** Check how the application reports errors from the package manager.

This basic testing will help ensure the core functionalities work as expected.

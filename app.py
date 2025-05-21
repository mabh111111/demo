import subprocess
import distro # Make sure distro is imported
from flask import Flask, jsonify, request, render_template # Add render_template
from pkg_manager_logic import get_distro_info, get_package_manager_command

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/distro', methods=['GET'])
def api_distro_info():
    return jsonify(get_distro_info())

@app.route('/api/packages/search/<package_name>', methods=['GET'])
def api_search_package(package_name):
    distro_id = distro.id()
    search_command_base = get_package_manager_command(distro_id, "search")

    if not search_command_base:
        return jsonify({"success": False, "error": f"Search command not available for {distro_id}"}), 404

    # Some package managers might have search commands that are multiple parts
    # e.g. ['apt-cache', 'search']
    # For simplicity, we assume get_package_manager_command returns a string to be split
    # or already a list. The current pkg_manager_logic.py returns a string.
    command_parts = search_command_base.split()
    command_parts.append(package_name)

    try:
        # Ensure text=True for string output, capture_output=True
        process = subprocess.run(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False) # text=False (or removed), capture_output removed
        
        stdout_str = process.stdout.decode('utf-8', errors='replace').strip()
        stderr_str = process.stderr.decode('utf-8', errors='replace').strip()

        if process.returncode == 0:
            return jsonify({"success": True, "package_name": package_name, "output": stdout_str})
        else:
            # Even if returncode is non-zero, there might be useful info in stdout for search
            return jsonify({"success": False, "package_name": package_name, "error": stderr_str, "output": stdout_str, "return_code": process.returncode}), 500

    except FileNotFoundError:
        return jsonify({"success": False, "error": f"Package manager command ({command_parts[0]}) not found. Is it in PATH?"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

# Placeholder for other API endpoints

@app.route('/api/packages/install/<package_name>', methods=['POST']) # Using POST for actions that change state
def api_install_package(package_name):
    distro_id = distro.id()
    # The install command from pkg_manager_logic.py should include sudo and -y/--noconfirm
    install_command_base = get_package_manager_command(distro_id, "install")

    if not install_command_base:
        return jsonify({"success": False, "error": f"Install command not available for {distro_id}"}), 404

    command_parts = install_command_base.split()
    command_parts.append(package_name)

    try:
        process = subprocess.run(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        
        stdout_str = process.stdout.decode('utf-8', errors='replace').strip()
        stderr_str = process.stderr.decode('utf-8', errors='replace').strip()

        if process.returncode == 0:
            # Some package managers might output to stderr even on success (e.g., warnings)
            # We can consider it a success if returncode is 0.
            # Frontend can display both stdout and stderr if needed.
            return jsonify({
                "success": True, 
                "package_name": package_name, 
                "message": f"Install command for '{package_name}' executed. Check output for status.",
                "output": stdout_str,
                "stderr_output_if_any": stderr_str # Provide stderr as well
            })
        else:
            return jsonify({
                "success": False, 
                "package_name": package_name, 
                "error": f"Failed to install {package_name}.",
                "output": stdout_str,
                "stderr_output": stderr_str, # Prioritize stderr_str for the "error" field if it exists
                "return_code": process.returncode
            }), 500

    except FileNotFoundError:
        # This catches if 'sudo' or the package manager command itself is not found
        return jsonify({"success": False, "error": f"Command ({command_parts[0]}) not found. Ensure it's in PATH and sudo is configured if necessary."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/packages/remove/<package_name>', methods=['POST']) # Using POST for actions that change state
def api_remove_package(package_name):
    distro_id = distro.id()
    # The remove command from pkg_manager_logic.py should include sudo and -y/--noconfirm
    remove_command_base = get_package_manager_command(distro_id, "remove")

    if not remove_command_base:
        return jsonify({"success": False, "error": f"Remove command not available for {distro_id}"}), 404

    command_parts = remove_command_base.split()
    command_parts.append(package_name)

    try:
        process = subprocess.run(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        
        stdout_str = process.stdout.decode('utf-8', errors='replace').strip()
        stderr_str = process.stderr.decode('utf-8', errors='replace').strip()

        if process.returncode == 0:
            return jsonify({
                "success": True, 
                "package_name": package_name, 
                "message": f"Remove command for '{package_name}' executed. Check output for status.",
                "output": stdout_str,
                "stderr_output_if_any": stderr_str
            })
        else:
            return jsonify({
                "success": False, 
                "package_name": package_name, 
                "error": f"Failed to remove {package_name}.",
                "output": stdout_str,
                "stderr_output": stderr_str,
                "return_code": process.returncode
            }), 500

    except FileNotFoundError:
        return jsonify({"success": False, "error": f"Command ({command_parts[0]}) not found. Ensure it's in PATH and sudo is configured if necessary."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/packages/update', methods=['POST']) # Using POST for actions that change state
def api_update_packages():
    distro_id = distro.id()
    update_command_str = get_package_manager_command(distro_id, "update_db") # e.g., "sudo apt-get update"

    if not update_command_str:
        return jsonify({"success": False, "error": f"Package database update command not available for {distro_id}"}), 404

    command_parts = update_command_str.split()

    try:
        process = subprocess.run(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        
        stdout_str = process.stdout.decode('utf-8', errors='replace').strip()
        stderr_str = process.stderr.decode('utf-8', errors='replace').strip()

        if process.returncode == 0:
            return jsonify({
                "success": True, 
                "message": "Package database update command executed. Check output for status.",
                "output": stdout_str,
                "stderr_output_if_any": stderr_str
            })
        else:
            return jsonify({
                "success": False, 
                "error": "Failed to update package database.",
                "output": stdout_str,
                "stderr_output": stderr_str,
                "return_code": process.returncode
            }), 500

    except FileNotFoundError:
        return jsonify({"success": False, "error": f"Command ({command_parts[0]}) not found. Ensure it's in PATH and sudo is configured if necessary."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/packages/list', methods=['GET'])
def api_list_packages():
    distro_id = distro.id()
    list_command_str = get_package_manager_command(distro_id, "list")

    if not list_command_str:
        return jsonify({"success": False, "error": f"List packages command not available for {distro_id}"}), 404

    command_parts = list_command_str.split()

    try:
        process = subprocess.run(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        
        stdout_str = process.stdout.decode('utf-8', errors='replace').strip()
        stderr_str = process.stderr.decode('utf-8', errors='replace').strip()

        if process.returncode == 0:
            # The output might be very large. Frontend should handle displaying it.
            return jsonify({
                "success": True, 
                "output": stdout_str
            })
        else:
            return jsonify({
                "success": False, 
                "error": "Failed to list packages.",
                "output": stdout_str, # Still provide stdout as it might contain partial info
                "stderr_output": stderr_str,
                "return_code": process.returncode
            }), 500

    except FileNotFoundError:
        return jsonify({"success": False, "error": f"Command ({command_parts[0]}) not found. Ensure it's in PATH."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') # Run on 0.0.0.0 to make it accessible

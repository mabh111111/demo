document.addEventListener('DOMContentLoaded', function() {
    fetchDistroInfo();
});

function displayOutput(message, type = 'info') {
    const outputArea = document.getElementById('outputArea');
    const time = new Date().toLocaleTimeString();
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `[${time}] ${message}`;
    if (type === 'error') {
        messageDiv.className = 'error';
    } else if (type === 'success') {
        messageDiv.className = 'success';
    }
    outputArea.appendChild(messageDiv);
    outputArea.scrollTop = outputArea.scrollHeight; // Scroll to bottom
}

async function fetchDistroInfo() {
    displayOutput('Fetching distribution information...');
    const distroInfoDiv = document.getElementById('distro-info'); // Get div once
    try {
        const response = await fetch('/api/distro');
        if (!response.ok) {
            // Try to get text for more detailed error, then fall back to statusText
            let errorText = "Unknown API error"; // Default error text
            try {
                errorText = await response.text(); // Attempt to get raw text
                const errorJson = JSON.parse(errorText); // Try to parse it as JSON
                errorText = errorJson.error || errorText; // Use JSON error message if available
            } catch (e) {
                // Parsing as JSON failed or text() failed, errorText remains raw or default
                 console.warn('Could not parse error response as JSON or read text body:', e);
            }
            displayOutput(`API Error fetching distro info: ${errorText} (Status: ${response.status})`, 'error');
            console.error(`API Error fetching distro info: ${errorText} (Status: ${response.status})`, await response.text().catch(()=>""));
            if (distroInfoDiv) {
                distroInfoDiv.innerHTML = '<p class="error">Failed to load distribution information. API error.</p>';
            }
            return; // Stop further processing
        }
        
        const data = await response.json(); // Now we expect this to succeed if response.ok

        if (distroInfoDiv) {
            distroInfoDiv.innerHTML = `
                <h2>Distribution Information</h2>
                <p><strong>ID:</strong> ${data.id || 'N/A'}</p>
                <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
                <p><strong>Version:</strong> ${data.version || 'N/A'}</p>
                <p><strong>Codename:</strong> ${data.codename || 'N/A'}</p>
                <p><strong>Like:</strong> ${data.like || 'N/A'}</p>
            `;
        }
        displayOutput('Distribution information loaded.', 'success');

    } catch (error) { // Catches network errors or errors in the try block (e.g. if response.json() fails after all)
        console.error('Fetch Distro Info Network/Parsing Error:', error);
        displayOutput(`Network or parsing error fetching distro info: ${error.message}. Check browser console.`, 'error');
        if (distroInfoDiv) {
            distroInfoDiv.innerHTML = '<p class="error">Failed to load distribution information due to a network or parsing error.</p>';
        }
    }
}

async function handleApiResponse(response, successMessagePrefix = '', errorMessagePrefix = '') {
    let data;
    try {
        data = await response.json();
        if (data.success) {
            displayOutput(`${successMessagePrefix}: ${data.message || ''}
Output:
${data.output || 'No output.'}
Stderr (if any):
${data.stderr_output_if_any || 'No stderr.'}`, 'success');
        } else {
            displayOutput(`${errorMessagePrefix}: ${data.error || 'Unknown API error'}
Output:
${data.output || 'No output.'}
Stderr:
${data.stderr_output || 'No stderr.'}
Return Code: ${data.return_code !== undefined ? data.return_code : 'N/A'}`, 'error');
        }
    } catch (error) {
        console.error('API Response handling error:', error, 'Response status:', response.status);
        const rawText = await response.text().catch(() => "Could not retrieve raw response text.");
        console.error('Raw response text:', rawText);
        displayOutput(`Error processing API response: ${error.message}. Server sent non-JSON response or other error. Raw response: ${rawText.substring(0, 500)}...`, 'error');
    }
}

async function handleRawOutputApiResponse(response, successMessagePrefix = '', errorMessagePrefix = '') {
    let data;
    try {
        data = await response.json();
        if (data.success) {
            displayOutput(`${successMessagePrefix}
Output:
${data.output || 'No output.'}`, 'success');
        } else {
            displayOutput(`${errorMessagePrefix}: ${data.error || 'Unknown API error'}
Output:
${data.output || 'No output.'}
Stderr:
${data.stderr_output || 'No stderr.'}
Return Code: ${data.return_code !== undefined ? data.return_code : 'N/A'}`, 'error');
        }
    } catch (error) {
        console.error('Raw API Response handling error:', error, 'Response status:', response.status);
        const rawText = await response.text().catch(() => "Could not retrieve raw response text.");
        console.error('Raw response text:', rawText);
        displayOutput(`Error processing raw API response: ${error.message}. Server sent non-JSON response or other error. Raw response: ${rawText.substring(0,500)}...`, 'error');
    }
}

async function searchPackage() {
    const packageName = document.getElementById('packageName').value.trim();
    if (!packageName) {
        displayOutput('Please enter a package name to search.', 'error');
        return;
    }
    displayOutput(`Searching for package: ${packageName}...`);
    try {
        const response = await fetch(`/api/packages/search/${packageName}`);
        await handleRawOutputApiResponse(response, `Search results for '${packageName}':`, `Error searching for '${packageName}'`);
    } catch (error) {
        console.error('Search Package Network Error:', error);
        displayOutput(`Network error searching package: ${error.message}`, 'error');
    }
}

async function installPackage() {
    const packageName = document.getElementById('packageName').value.trim();
    if (!packageName) {
        displayOutput('Please enter a package name to install.', 'error');
        return;
    }
    displayOutput(`Attempting to install package: ${packageName}...`);
    try {
        const response = await fetch(`/api/packages/install/${packageName}`, { method: 'POST' });
        await handleApiResponse(response, `Install command for '${packageName}' executed`, `Error installing '${packageName}'`);
    } catch (error) {
        console.error('Install Package Network Error:', error);
        displayOutput(`Network error installing package: ${error.message}`, 'error');
    }
}

async function removePackage() {
    const packageName = document.getElementById('packageName').value.trim();
    if (!packageName) {
        displayOutput('Please enter a package name to remove.', 'error');
        return;
    }
    displayOutput(`Attempting to remove package: ${packageName}...`);
    try {
        const response = await fetch(`/api/packages/remove/${packageName}`, { method: 'POST' });
        await handleApiResponse(response, `Remove command for '${packageName}' executed`, `Error removing '${packageName}'`);
    } catch (error) {
        console.error('Remove Package Network Error:', error);
        displayOutput(`Network error removing package: ${error.message}`, 'error');
    }
}

async function updateDatabase() {
    displayOutput('Attempting to update package database...');
    try {
        const response = await fetch('/api/packages/update', { method: 'POST' });
        await handleApiResponse(response, 'Package database update command executed', 'Error updating package database');
    } catch (error) {
        console.error('Update Database Network Error:', error);
        displayOutput(`Network error updating database: ${error.message}`, 'error');
    }
}

async function listPackages() {
    displayOutput('Attempting to list installed packages...');
    try {
        const response = await fetch('/api/packages/list');
        await handleRawOutputApiResponse(response, 'Installed packages list:', 'Error listing packages');
    } catch (error) { // Added missing opening brace from previous diagnosis
        console.error('List Packages Network Error:', error);
        displayOutput(`Network error listing packages: ${error.message}`, 'error');
    }
}

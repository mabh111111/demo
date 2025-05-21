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
    try {
        const response = await fetch('/api/distro');
        const data = await response.json();
        if (response.ok) {
            const distroInfoDiv = document.getElementById('distro-info');
            distroInfoDiv.innerHTML = `
                <h2>Distribution Information</h2>
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Version:</strong> ${data.version}</p>
                <p><strong>Codename:</strong> ${data.codename}</p>
                <p><strong>Like:</strong> ${data.like}</p>
            `;
            displayOutput('Distribution information loaded.', 'success');
        } else {
            displayOutput(`Error fetching distro info: ${data.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        displayOutput(`Network error fetching distro info: ${error}`, 'error');
    }
}

async function handleApiResponse(response, successMessagePrefix = '', errorMessagePrefix = '') {
    const data = await response.json();
    if (data.success) {
        displayOutput(`${successMessagePrefix}: ${data.message || ''}
Output:
${data.output || ''}
Stderr (if any):
${data.stderr_output_if_any || ''}`, 'success');
    } else {
        displayOutput(`${errorMessagePrefix}: ${data.error || 'Unknown error'}
Output:
${data.output || ''}
Stderr:
${data.stderr_output || ''}`, 'error');
    }
}

async function handleRawOutputApiResponse(response, successMessagePrefix = '', errorMessagePrefix = '') {
    const data = await response.json();
    if (data.success) {
        displayOutput(`${successMessagePrefix}
Output:
${data.output || ''}`, 'success');
    } else {
        displayOutput(`${errorMessagePrefix}: ${data.error || 'Unknown error'}
Output:
${data.output || ''}
Stderr:
${data.stderr_output || ''}`, 'error');
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
        displayOutput(`Network error searching package: ${error}`, 'error');
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
        displayOutput(`Network error installing package: ${error}`, 'error');
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
        displayOutput(`Network error removing package: ${error}`, 'error');
    }
}

async function updateDatabase() {
    displayOutput('Attempting to update package database...');
    try {
        const response = await fetch('/api/packages/update', { method: 'POST' });
        await handleApiResponse(response, 'Package database update command executed', 'Error updating package database');
    } catch (error) {
        displayOutput(`Network error updating database: ${error}`, 'error');
    }
}

async function listPackages() {
    displayOutput('Attempting to list installed packages...');
    try {
        const response = await fetch('/api/packages/list');
        await handleRawOutputApiResponse(response, 'Installed packages list:', 'Error listing packages');
    } catch (error)
        displayOutput(`Network error listing packages: ${error}`, 'error');
    }
}

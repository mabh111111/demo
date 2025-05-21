import distro

def get_distro_info():
    return {
        "id": distro.id(),
        "name": distro.name(),
        "version": distro.version(),
        "codename": distro.codename(),
        "like": distro.like()
    }

# Placeholder for package manager command mapping
PACKAGE_MANAGER_COMMANDS = {
    "ubuntu": {
        "update_db": "sudo apt-get update",
        "search": "apt-cache search", # Does not require sudo
        "install": "sudo apt-get install -y",
        "remove": "sudo apt-get remove -y",
        "list": "apt list --installed" # Does not require sudo
    },
    "debian": {
        "update_db": "sudo apt-get update",
        "search": "apt-cache search",
        "install": "sudo apt-get install -y",
        "remove": "sudo apt-get remove -y",
        "list": "apt list --installed"
    },
    "centos": {
        "update_db": "sudo yum check-update", # This is more of a check, actual update is different
        "search": "yum search", # Does not require sudo
        "install": "sudo yum install -y",
        "remove": "sudo yum remove -y",
        "list": "yum list installed" # Does not require sudo
    },
    "fedora": {
        "update_db": "sudo dnf check-update", # Similar to yum
        "search": "dnf search", # Does not require sudo
        "install": "sudo dnf install -y",
        "remove": "sudo dnf remove -y",
        "list": "dnf list installed" # Does not require sudo
    },
    "arch": {
        "update_db": "sudo pacman -Sy",
        "search": "pacman -Ss", # Does not require sudo
        "install": "sudo pacman -S --noconfirm",
        "remove": "sudo pacman -Rns --noconfirm",
        "list": "pacman -Q" # Does not require sudo
    },
    "opensuse-leap": { # Example for openSUSE, ID might vary, check distro.id()
        "update_db": "sudo zypper refresh",
        "search": "zypper search", # Does not require sudo
        "install": "sudo zypper install -y",
        "remove": "sudo zypper remove -y",
        "list": "zypper pa -i" # Does not require sudo
    }
}

def get_package_manager_command(distro_id, action):
    distro_id_lower = distro_id.lower() # Normalize to lowercase
    # Handle cases where distro.id() might return variations e.g. 'opensuse-leap', 'opensuse-tumbleweed'
    # We might need to check distro.like() as well for broader compatibility
    
    # Direct match
    if distro_id_lower in PACKAGE_MANAGER_COMMANDS:
        if action in PACKAGE_MANAGER_COMMANDS[distro_id_lower]:
            return PACKAGE_MANAGER_COMMANDS[distro_id_lower][action]
        else:
            return None # Action not defined for this distro

    # Check os-release "ID_LIKE" field
    # This helps catch derivatives (e.g. Linux Mint is like Ubuntu)
    liked_distros = distro.like().split()
    for liked_distro in liked_distros:
        liked_distro_lower = liked_distro.lower()
        if liked_distro_lower in PACKAGE_MANAGER_COMMANDS:
            if action in PACKAGE_MANAGER_COMMANDS[liked_distro_lower]:
                # Return command from the 'liked' distro
                return PACKAGE_MANAGER_COMMANDS[liked_distro_lower][action] 
            else:
                # Action not defined for the 'liked' distro's base
                continue 
    return None # No command found for this distro or its likes

if __name__ == '__main__':
    # Example usage (optional, for testing)
    print(get_distro_info())
    distro_id = distro.id()
    print(f"Install command for {distro_id}: {get_package_manager_command(distro_id, 'install')}")
    print(f"Search command for {distro_id}: {get_package_manager_command(distro_id, 'search')}")
    print(f"Update DB command for {distro_id}: {get_package_manager_command(distro_id, 'update_db')}")

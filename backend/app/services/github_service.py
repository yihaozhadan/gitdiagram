import requests
from dotenv import load_dotenv

load_dotenv()


class GitHubService:
    def __init__(self, github_token):
        self.github_token = github_token
        self.headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github+json"
        }

    def get_default_branch(self, username, repo):
        """Get the default branch of the repository."""
        api_url = f"https://api.github.com/repos/{username}/{repo}"
        response = requests.get(api_url, headers=self.headers)

        if response.status_code == 200:
            return response.json().get('default_branch')
        return None

    def get_github_file_paths_as_list(self, username, repo):
        """
        Fetches the complete file tree of an open-source GitHub repository.

        Args:
            username (str): The GitHub username or organization name
            repo (str): The repository name

        Returns:
            list: A list of file and directory paths in the repository.
        """
        # Try to get the default branch first
        branch = self.get_default_branch(username, repo)
        if branch:
            api_url = f"https://api.github.com/repos/{
                username}/{repo}/git/trees/{branch}?recursive=1"
            response = requests.get(api_url, headers=self.headers)

            if response.status_code == 200:
                data = response.json()
                if "tree" in data:
                    return [item['path'] for item in data['tree']]

        # If default branch didn't work or wasn't found, try common branch names
        for branch in ['main', 'master']:
            api_url = f"https://api.github.com/repos/{
                username}/{repo}/git/trees/{branch}?recursive=1"
            response = requests.get(api_url, headers=self.headers)

            if response.status_code == 200:
                data = response.json()
                if "tree" in data:
                    return [item['path'] for item in data['tree']]

        raise ValueError(
            "Could not fetch repository file tree. Repository might be empty or private.")

    def get_github_readme(self, username, repo):
        """
        Fetches the README contents of an open-source GitHub repository.

        Args:
            username (str): The GitHub username or organization name
            repo (str): The repository name

        Returns:
            str: The contents of the README file.
        """
        api_url = f"https://api.github.com/repos/{username}/{repo}/readme"

        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github+json"
        }

        response = requests.get(api_url, headers=headers)

        if response.status_code == 404:
            raise ValueError("Repository not found.")
        elif response.status_code != 200:
            raise Exception(f"Failed to fetch README: {
                            response.status_code}, {response.json()}")

        data = response.json()
        readme_content = requests.get(data['download_url']).text
        return readme_content

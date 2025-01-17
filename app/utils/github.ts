export async function fetchGitHubProjects(username: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&direction=desc`);
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub projects');
      }
      const data = await response.json();
      return data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        topics: repo.topics || [],
      }));
    } catch (error) {
      console.error('Error fetching GitHub projects:', error);
      return [];
    }
  }
  
  
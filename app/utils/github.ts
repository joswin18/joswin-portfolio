interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
}

interface GitHubPullRequest {
  id: number;
  repository_url: string;
  html_url: string;
}

interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  fork: boolean;
}

interface Contribution {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  originalRepo: string;
}

async function fetchUserRepos(username: string): Promise<GitHubProject[]> {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=100`);
  if (!response.ok) throw new Error('Failed to fetch user repositories');
  const data = await response.json() as GitHubRepo[];
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language || '',
    topics: repo.topics || [],
    fork: repo.fork,
  }));
}

async function fetchContributions(username: string): Promise<Contribution[]> {
  const response = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr+is:merged&per_page=100`);
  if (!response.ok) throw new Error('Failed to fetch contributions');
  const data = await response.json();
  
  const contributions = await Promise.all(
    data.items.slice(0, 10).map(async (item: GitHubPullRequest) => {
      const repoResponse = await fetch(item.repository_url);
      if (!repoResponse.ok) throw new Error('Failed to fetch repository details');
      const repoData = await repoResponse.json() as GitHubRepo;
      
      return {
        id: item.id,
        name: repoData.name,
        description: repoData.description || '',
        url: item.html_url,
        stars: repoData.stargazers_count,
        language: repoData.language || '',
        topics: repoData.topics || [],
        originalRepo: repoData.name,
      };
    })
  );

  return contributions;
}

export async function fetchGitHubProjects(username: string): Promise<{ projects: GitHubProject[], contributions: Contribution[] }> {
  try {
    const [allRepos, contributions] = await Promise.all([
      fetchUserRepos(username),
      fetchContributions(username)
    ]);

    const projects = allRepos.filter(repo => !repo.fork);

    projects.sort((a, b) => b.stars - a.stars);
    contributions.sort((a, b) => b.stars - a.stars);

    return {
      projects,
      contributions: contributions.filter((contribution, index, self) =>
        index === self.findIndex((t) => t.id === contribution.id)
      )
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return { projects: [], contributions: [] };
  }
}


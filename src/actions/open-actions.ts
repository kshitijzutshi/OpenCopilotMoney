"use server";

export interface GitHubStats {
  stargazers: number;
  forks: number;
  openIssues: number;
  totalCommits: number;
}

export async function getGitHubStats(): Promise<GitHubStats> {
  try {
    // Replace 'username/repo' with your actual GitHub repository
    const repoUrl = "https://api.github.com/repos/codehagen/badget";

    const [repoResponse, commitsResponse] = await Promise.all([
      fetch(repoUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token if you have rate limiting issues
          // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }),
      fetch(`${repoUrl}/commits?per_page=1`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 300 },
      }),
    ]);

    if (!repoResponse.ok || !commitsResponse.ok) {
      throw new Error("Failed to fetch GitHub data");
    }

    const repoData = await repoResponse.json();

    // Get commit count from the Link header or default to a reasonable number
    const linkHeader = commitsResponse.headers.get("Link");
    let totalCommits = 149; // Fallback to current number

    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        totalCommits = parseInt(lastPageMatch[1]);
      }
    }

    return {
      stargazers: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      totalCommits: totalCommits,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);

    // Return current fallback values if API fails
    return {
      stargazers: 2600, // 2.6k
      forks: 285,
      openIssues: 3,
      totalCommits: 149,
    };
  }
}

"use server";
import { cache } from "react";
import { env } from "~/env";

interface GitHubResponse {
  stargazers_count: number;
}

export const getStarCount = cache(async () => {
  try {
    const response = await fetch(
      "https://api.github.com/repos/yihaozhadan/gitdiagram",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: {
          revalidate: 300, // Cache for 5 minutes
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch star count");
    }

    const data = (await response.json()) as GitHubResponse;
    return data.stargazers_count;
  } catch (error) {
    console.error("Error fetching star count:", error);
    return null;
  }
});

export async function getLatestCommitDate(username: string, repo: string): Promise<Date | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    // Use GitHub PAT if available to increase rate limit
    if (env.GITHUB_PAT) {
      headers.Authorization = `token ${env.GITHUB_PAT}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/branches/main`,
      { headers },
    );

    // If main branch not found, try master branch
    if (response.status === 404) {
      const masterResponse = await fetch(
        `https://api.github.com/repos/${username}/${repo}/branches/master`,
        { headers },
      );
      if (!masterResponse.ok) {
        throw new Error(`Failed to fetch commit date: ${masterResponse.statusText}`);
      }
      const data = await masterResponse.json() as { commit: { commit: { committer: { date: string } } } };
      return new Date(data.commit.commit.committer.date);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch commit date: ${response.statusText}`);
    }

    const data = await response.json() as { commit: { commit: { committer: { date: string } } } };
    return new Date(data.commit.commit.committer.date);
  } catch (error) {
    console.error("Error fetching latest commit date:", error);
    return null;
  }
}

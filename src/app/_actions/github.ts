import { cache } from "react";

interface GitHubResponse {
  stargazers_count: number;
}

export const getStarCount = cache(async () => {
  try {
    const response = await fetch(
      "https://api.github.com/repos/ahmedkhaleel2004/gitdiagram",
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

"use server";

import { cacheDiagram, getCachedDiagram } from "~/app/_actions/cache";

interface ApiResponse {
  error?: string;
  response?: string;
}

export async function generateAndCacheDiagram(
  username: string,
  repo: string,
  instructions?: string,
): Promise<ApiResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const url = new URL(`${baseUrl}/generate`);
    url.searchParams.append("username", username);
    url.searchParams.append("repo", repo);
    if (instructions) {
      url.searchParams.append("instructions", instructions);
    }

    const response = await fetch(url);
    const data = (await response.json()) as ApiResponse;

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    if (data.error) {
      return { error: data.error };
    }

    await cacheDiagram(username, repo, data.response!);
    return { response: data.response };
  } catch (error) {
    console.error("Error generating diagram:", error);
    return { error: "Failed to generate diagram. Please try again later." };
  }
}

export async function modifyAndCacheDiagram(
  username: string,
  repo: string,
  instructions: string,
): Promise<ApiResponse> {
  try {
    // First get the current diagram from cache
    const currentDiagram = await getCachedDiagram(username, repo);

    if (!currentDiagram) {
      return { error: "No existing diagram found to modify" };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const url = new URL(`${baseUrl}/modify`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instructions: instructions,
        current_diagram: currentDiagram,
      }),
    });

    const data = (await response.json()) as ApiResponse;

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    if (data.error) {
      return { error: data.error };
    }

    await cacheDiagram(username, repo, data.response!);
    return { response: data.response };
  } catch (error) {
    console.error("Error modifying diagram:", error);
    return { error: "Failed to modify diagram. Please try again later." };
  }
}

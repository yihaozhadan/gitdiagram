// Add interface for the API response
interface ApiResponse {
  error?: string;
  response?: string;
}

export async function fetchDiagram(
  username: string,
  repo: string,
): Promise<ApiResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const response = await fetch(
      `${baseUrl}/generate?username=${username}&repo=${repo}`,
    );
    const data = (await response.json()) as ApiResponse;

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    if (data.error) {
      return { error: data.error };
    }

    return { response: data.response };
  } catch (error) {
    console.error("Error fetching diagram:", error);
    return { error: "Failed to generate diagram. Please try again later." };
  }
}

export async function modifyDiagram(
  username: string,
  repo: string,
  instructions: string,
): Promise<ApiResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const response = await fetch(
      `${baseUrl}/modify?username=${username}&repo=${repo}&instructions=${encodeURIComponent(
        instructions,
      )}`,
    );
    const data = (await response.json()) as ApiResponse;

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    if (data.error) {
      return { error: data.error };
    }

    return { response: data.response };
  } catch (error) {
    console.error("Error modifying diagram:", error);
    return { error: "Failed to modify diagram. Please try again later." };
  }
}

export interface DiagramResponse {
  response: string;
}

export async function fetchDiagram(
  username: string,
  repo: string,
): Promise<string> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const response = await fetch(
      `${baseUrl}/analyze?username=${username}&repo=${repo}`,
    );
    const data = (await response.json()) as DiagramResponse;
    console.log("backend data: ", data);
    return data.response;
  } catch (error) {
    console.error("Error fetching diagram:", error);
    throw error;
  }
}

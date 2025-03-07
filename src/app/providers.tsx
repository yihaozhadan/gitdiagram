// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  // Only initialize PostHog if the environment variables are available
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  // const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
    });
  } else {
    console.log(
      "PostHog environment variables are not set. Analytics will be disabled. Skipping PostHog initialization.",
    );
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

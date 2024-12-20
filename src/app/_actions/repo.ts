"use server";

import { db } from "~/server/db";
import { eq, and } from "drizzle-orm";
import { diagramCache } from "~/server/db/schema";

export async function getLastGeneratedDate(username: string, repo: string) {
  const result = await db
    .select()
    .from(diagramCache)
    .where(
      and(eq(diagramCache.username, username), eq(diagramCache.repo, repo)),
    );

  return result[0]?.updatedAt;
}

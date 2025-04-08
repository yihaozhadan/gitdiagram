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

  if (!result || result.length === 0) {
    return null;
  }
  // We know result[0] exists because we checked length above
  return result[0]!.updatedAt;
}

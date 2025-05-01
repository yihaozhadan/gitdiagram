"use server";

import { db } from "~/server/db";
import { eq, and, desc } from "drizzle-orm";
import { diagramCache } from "~/server/db/schema";
import { sql } from "drizzle-orm";

export async function getCachedDiagram(username: string, repo: string) {
  try {
    const cached = await db
      .select()
      .from(diagramCache)
      .where(
        and(eq(diagramCache.username, username), eq(diagramCache.repo, repo)),
      )
      .limit(1);

    return cached[0]?.diagram ?? null;
  } catch (error) {
    console.error("Error fetching cached diagram:", error);
    return null;
  }
}

export async function getCachedExplanation(username: string, repo: string) {
  try {
    const cached = await db
      .select()
      .from(diagramCache)
      .where(
        and(eq(diagramCache.username, username), eq(diagramCache.repo, repo)),
      )
      .limit(1);

    return cached[0]?.explanation ?? null;
  } catch (error) {
    console.error("Error fetching cached explanation:", error);
    return null;
  }
}

export async function cacheDiagramAndExplanation(
  username: string,
  repo: string,
  diagram: string,
  explanation: string,
  usedOwnKey = false,
) {
  try {
    await db
      .insert(diagramCache)
      .values({
        username,
        repo,
        diagram,
        explanation,
        usedOwnKey,
      })
      .onConflictDoUpdate({
        target: [diagramCache.username, diagramCache.repo],
        set: {
          diagram,
          explanation,
          usedOwnKey,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Error caching diagram:", error);
  }
}

export async function getLastGeneratedDate(username: string, repo: string): Promise<Date | null> {
  try {
    const cached = await db
      .select({
        updatedAt: diagramCache.updatedAt,
      })
      .from(diagramCache)
      .where(
        and(eq(diagramCache.username, username), eq(diagramCache.repo, repo)),
      )
      .limit(1);

    return cached[0]?.updatedAt ?? null;
  } catch (error) {
    console.error("Error fetching last generated date:", error);
    return null;
  }
}

export async function getDiagramStats() {
  try {
    const stats = await db
      .select({
        totalDiagrams: sql`COUNT(*)`,
        ownKeyUsers: sql`COUNT(CASE WHEN ${diagramCache.usedOwnKey} = true THEN 1 END)`,
        freeUsers: sql`COUNT(CASE WHEN ${diagramCache.usedOwnKey} = false THEN 1 END)`,
      })
      .from(diagramCache);

    return stats[0];
  } catch (error) {
    console.error("Error getting diagram stats:", error);
    return null;
  }
}

export type SortField = 'repository' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface PaginationInfo {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface DiagramCacheItemWithDate {
  username: string;
  repo: string;
  updated_at: Date;
}

export interface CacheFetchResult {
  data: DiagramCacheItemWithDate[];
  pagination: PaginationInfo;
}

export interface CacheFetchParams {
  sortBy?: SortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getAllCachedDiagrams(params?: CacheFetchParams): Promise<CacheFetchResult> {
  try {
    const {
      sortBy = 'repository',
      sortDirection = 'asc',
      page = 1,
      pageSize = 20,
      search = '',
    } = params ?? {};
    
    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Build search condition if needed
    let searchCondition;
    if (search) {
      const searchLower = search.toLowerCase();
      searchCondition = sql`LOWER(${diagramCache.username} || '/' || ${diagramCache.repo}) LIKE '%' || ${searchLower} || '%'`;
    }
    
    // Count total results first
    const countQueryBase = db.select({ count: sql<number>`count(*)` }).from(diagramCache);
    const countQuery = searchCondition 
      ? countQueryBase.where(searchCondition)
      : countQueryBase;
    
    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count ?? 0;
    
    // Build main data query
    const dataQuery = db
      .select({
        username: diagramCache.username,
        repo: diagramCache.repo,
        updated_at: diagramCache.updatedAt
      })
      .from(diagramCache);
    
    // Apply search filter if provided
    const filteredQuery = searchCondition 
      ? dataQuery.where(searchCondition)
      : dataQuery;
    
    // Apply sorting - need different query objects for each sorting option
    let sortedQuery;
    if (sortBy === 'repository') {
      if (sortDirection === 'asc') {
        // For repository sorting, we need to sort by username first, then repo
        // Create a SQL expression for concatenated username/repo for proper sorting
        const repoFullNameAsc = sql`${diagramCache.username} || '/' || ${diagramCache.repo}`;
        sortedQuery = filteredQuery.orderBy(repoFullNameAsc);
      } else {
        // For descending order, use desc() on the concatenated expression
        const repoFullNameDesc = sql`${diagramCache.username} || '/' || ${diagramCache.repo}`;
        sortedQuery = filteredQuery.orderBy(desc(repoFullNameDesc));
      }
    } else { // sortBy === 'updated_at'
      if (sortDirection === 'asc') {
        sortedQuery = filteredQuery.orderBy(diagramCache.updatedAt);
      } else {
        sortedQuery = filteredQuery.orderBy(desc(diagramCache.updatedAt));
      }
    }
    
    // Apply pagination
    const results = await sortedQuery.limit(pageSize).offset(offset);
    
    return {
      data: results,
      pagination: {
        total: totalCount,
        pageSize,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  } catch (error) {
    console.error("Error fetching all cached diagrams:", error);
    return {
      data: [],
      pagination: {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0
      }
    };
  }
}

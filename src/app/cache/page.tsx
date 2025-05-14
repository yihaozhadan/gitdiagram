import { getAllCachedDiagrams } from '../_actions/cache';
import CachePageClient from './cache-page-client';
import { Suspense } from 'react';

export default async function Page() {
  // Get all diagrams with default parameters
  const result = await getAllCachedDiagrams();

  return (
    <Suspense fallback={<div className="p-4">Loading cached diagrams...</div>}>
      <CachePageClient 
        data={result.data} 
        pagination={result.pagination} 
        initialSortBy="updated_at"
        initialSortDirection="desc"
        initialSearch=""
      />
    </Suspense>
  );
}
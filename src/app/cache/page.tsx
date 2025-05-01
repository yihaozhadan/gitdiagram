import { getAllCachedDiagrams } from '../_actions/cache';
import CachePageClient from './cache-page-client';

export default async function Page() {
  const stats = await getAllCachedDiagrams();
  return <CachePageClient stats={stats} />;
}
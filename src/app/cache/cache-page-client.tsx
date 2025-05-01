'use client';

import React from 'react';
import Link from 'next/link';

export interface DiagramCacheItem {
  username: string;
  repo: string;
  updated_at: Date;
}

interface CachePageClientProps {
  stats: DiagramCacheItem[];
}

export default function CachePageClient({ stats }: CachePageClientProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cached Diagrams</h1>
      {stats && stats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">GitHub Repository</th>
                <th className="py-2 px-4 border-b">Last Updated</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item) => (
                <tr key={`${item.username}/${item.repo}`} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <a 
                      href={`https://github.com/${item.username}/${item.repo}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.username}/{item.repo}
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.updated_at.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link 
                      href={`/${item.username}/${item.repo}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Diagram
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No cached diagrams found.</p>
      )}
    </div>
  );
}

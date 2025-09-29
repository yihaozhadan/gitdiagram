'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { getAllCachedDiagrams } from '../_actions/cache'; // No longer used on client
import type { DiagramCacheItemWithDate, PaginationInfo, SortField, SortDirection } from '../_actions/cache';

interface CachePageClientProps {
  data: DiagramCacheItemWithDate[];
  pagination: PaginationInfo;
  initialSortBy: SortField;
  initialSortDirection: SortDirection;
  initialSearch: string;
}

interface SortIndicatorProps {
  isActive: boolean;
  direction: SortDirection;
}

function SortIndicator({ isActive, direction }: SortIndicatorProps) {
  if (!isActive) return <span className="text-gray-300 dark:text-gray-600 ml-1">↑↓</span>;
  
  return (
    <span className="ml-1 text-foreground">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export default function CachePageClient({ 
  data: initialData, 
  pagination: initialPagination, 
  initialSortBy, 
  initialSortDirection,
  initialSearch
}: CachePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDark, setIsDark] = useState(false);
  
  // Parse URL parameters
  const urlSortBy = (searchParams.get('sortBy') as SortField) ?? initialSortBy;
  const urlSortDirection = (searchParams.get('sortDirection') as SortDirection) ?? initialSortDirection;
  const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const urlSearch = searchParams.get('search') ?? initialSearch;
  
  // State for data and pagination
  const [data, setData] = useState<DiagramCacheItemWithDate[]>(initialData);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [loading, setLoading] = useState(false);
  
  // State for sorting and pagination
  const [sortBy, setSortBy] = useState<SortField>(urlSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(urlSortDirection);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [search, setSearch] = useState(urlSearch);
  const [searchInput, setSearchInput] = useState(urlSearch);
  
  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    
    // Initial check
    checkDarkMode();
    
    // Watch for theme changes
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Update URL when params change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('sortBy', sortBy);
    params.set('sortDirection', sortDirection);
    params.set('page', currentPage.toString());
    if (search) params.set('search', search);
    
    const url = `${pathname}?${params.toString()}`;
    // Handle the promise to avoid ESLint error
    void router.push(url, { scroll: false });
  }, [sortBy, sortDirection, currentPage, search, pathname, router]);
  
  // Fetch data when params change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          sortBy,
          sortDirection,
          page: currentPage.toString(),
          pageSize: pagination.pageSize.toString(),
        });
        if (search) params.set('search', search);
        const res = await fetch(`/api/cache?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch cache data');
        type ApiResponse = { data: DiagramCacheItemWithDate[]; pagination: PaginationInfo };
       // eslint-disable-next-line
        const result: ApiResponse = await res.json();
        setData(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data when sort parameters change
    void fetchData();
    
  }, [sortBy, sortDirection, currentPage, search, pagination.pageSize]);
  
  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default ascending direction
      setSortBy(field);
      setSortDirection('asc');
    }
    // Reset to first page when sort changes
    setCurrentPage(1);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setCurrentPage(1); // Reset to first page when clearing search
  };
  
  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Cached Diagrams</h1>
      
      {/* Search form */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search repositories..."
            className={`px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'}`}
          />
          <button 
            type="submit"
            className={`px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-blue-700' : 'bg-blue-600'}`}
          >
            Search
          </button>
          {searchInput && (
            <button 
              type="button"
              onClick={handleClearSearch}
              className={`px-4 py-2 rounded-r hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 ml-1 ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700'}`}
            >
              Clear
            </button>
          )}
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data.length > 0 ? (
        <>
          <div className="overflow-x-auto mb-4">
            <table className={`min-w-full border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <thead>
                <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th 
                    className={`py-2 px-4 border-b cursor-pointer select-none ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-black'}`}
                    onClick={() => toggleSort('repository')}
                  >
                    GitHub Repository
                    <SortIndicator 
                      isActive={sortBy === 'repository'} 
                      direction={sortDirection} 
                    />
                  </th>
                  <th 
                    className={`py-2 px-4 border-b cursor-pointer select-none ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-black'}`}
                    onClick={() => toggleSort('updated_at')}
                  >
                    Last Updated
                    <SortIndicator 
                      isActive={sortBy === 'updated_at'} 
                      direction={sortDirection} 
                    />
                  </th>
                  <th className={`py-2 px-4 border-b ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-black'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={`${item.username}/${item.repo}`} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`py-2 px-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <a 
                        href={`https://github.com/${item.username}/${item.repo}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        {item.username}/{item.repo}
                      </a>
                    </td>
                    <td className={`py-2 px-4 border-b ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-black'}`}>
                      {new Date(item.updated_at).toLocaleString()}
                    </td>
                    <td className={`py-2 px-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <Link 
                        href={`/${item.username}/${item.repo}`}
                        className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        View Diagram
                      </Link>
                      { " | " }
                      <Link 
                        href={`https://gitmcp.io/${item.username}/${item.repo}/chat`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        Chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Showing <span className="font-medium">{((currentPage - 1) * pagination.pageSize) + 1}</span> to <span className="font-medium">{Math.min(currentPage * pagination.pageSize, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'}`}
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'}`}
                >
                  Prev
                </button>
                {/* Page number display */}
                <span className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'}`}
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'}`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {search ? `No cached diagrams found matching "${search}"` : "No cached diagrams found."}
        </p>
      )}
    </div>
  );
}

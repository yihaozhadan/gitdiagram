import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { SortDirection, SortField } from '../../_actions/cache';
import { getAllCachedDiagrams } from '../../_actions/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sortBy = searchParams.get('sortBy') ?? 'updated_at';
  const sortDirection = searchParams.get('sortDirection') ?? 'desc';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
  const search = searchParams.get('search') ?? '';

  try {
    const result = await getAllCachedDiagrams({
      sortBy: sortBy as SortField,
      sortDirection: sortDirection as SortDirection,
      page,
      pageSize,
      search,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ data: [], pagination: { total: 0, pageSize, currentPage: page, totalPages: 0 }, error: String(error) }, { status: 500 });
  }
}

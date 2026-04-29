export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export function parsePagination(query: { page?: unknown; limit?: unknown; search?: unknown }): PaginationOptions | undefined {
  const page = Number(query.page);
  const limit = Number(query.limit);
  const search = typeof query.search === 'string' ? query.search.trim() : undefined;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return search ? { search } : undefined;
  }

  return {
    page,
    limit: Math.min(limit, 100),
    search: search || undefined,
  };
}

export function pageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

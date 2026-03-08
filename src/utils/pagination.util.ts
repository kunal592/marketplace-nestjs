export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Calculate pagination offset from page and limit.
 */
export function getPaginationOffset(page: number, limit: number): { skip: number; take: number } {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Cap at 100

    return {
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
    };
}

/**
 * Build a paginated result object.
 */
export function buildPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}

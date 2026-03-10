import { fetcher } from './fetcher';

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    vendorId: string;
    categoryId: string;
}

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: string) => [...productKeys.lists(), { filters }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (slug: string) => [...productKeys.details(), slug] as const,
};

export const fetchProducts = async (params: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    // The backend returns paginated result: { data: Product[], total: number } or similar
    return fetcher<{ data: Product[], meta: any }>(endpoint);
};

export const fetchProductBySlug = async (slug: string) => {
    return fetcher<Product>(`/products/${slug}`);
};

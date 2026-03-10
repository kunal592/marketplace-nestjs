'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProducts, productKeys } from '@/lib/api/productService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ProductsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: productKeys.list('all'),
        queryFn: () => fetchProducts({ sort: 'newest' }),
    });

    const products = data?.data || [];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">The Catalog</h1>
                    <p className="text-muted-foreground">Explore our curated selection of premium gear.</p>
                </div>
                <div className="flex gap-4">
                    {/* Filters placeholder */}
                    <Button variant="outline" className="rounded-full">Filters</Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground w-full">
                    <p>Failed to load the catalog. Ensure backend runs effectively.</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground w-full">
                    <p>No products found in the catalog.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
                    {products.map((product) => (
                        <Link href={`/products/${product.slug}`} key={product.id} className="group cursor-pointer block">
                            <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                {product.images && product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 transition-transform duration-700 group-hover:scale-105" />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                                    <Button
                                        className="w-full bg-black/80 backdrop-blur-md text-white hover:bg-black rounded-full"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium line-clamp-1">{product.slug}</p>
                                <h3 className="font-semibold text-base leading-tight line-clamp-1">{product.name}</h3>
                                <p className="text-sm">${product.price.toFixed(2)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

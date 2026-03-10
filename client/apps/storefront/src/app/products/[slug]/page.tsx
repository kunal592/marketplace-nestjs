'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProductBySlug } from '@/lib/api/productService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const addItem = useCartStore((state) => state.addItem);

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProductBySlug(slug),
    });

    const [selectedImage, setSelectedImage] = useState<number>(0);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 lg:py-24 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-2/3" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Product not found</h2>
                <p className="text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0],
            vendorId: product.vendorId, // Required for order splitting
        });
        toast.success('Added to cart', { description: `${product.name} was added to your cart.` });
    };

    return (
        <div className="container mx-auto px-4 py-12 lg:py-24 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Images section */}
                <div className="flex flex-col gap-4">
                    <div className="aspect-square relative overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center">
                        {product.images && product.images[selectedImage] ? (
                            <img src={product.images[selectedImage]} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800" />
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative aspect-square w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info section */}
                <div className="flex flex-col space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
                        <p className="text-xl text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert">
                        <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                            {product.description || "Incredible craftsmanship meets visionary design. This piece represents the pinnacle of modern streetwear capability."}
                        </p>
                    </div>

                    <div className="pt-6 border-t">
                        <Button size="lg" className="w-full rounded-full uppercase tracking-wider font-semibold h-14" onClick={handleAddToCart}>
                            Add to Cart
                        </Button>
                    </div>

                    <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                        <p>Free standard shipping on all orders over $150.</p>
                        <p>14-day return policy available for pristine items.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

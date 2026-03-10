'use client';

import { useCartStore } from '@/store/cartStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CartDrawer() {
    const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4">
                        <div className="text-muted-foreground">Your cart is empty.</div>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-6 pt-4">
                            <ul className="flex flex-col gap-6">
                                {items.map((item) => (
                                    <li key={`${item.productId}-${item.variantId}`} className="flex items-start gap-4">
                                        <div className="relative aspect-square h-20 w-20 min-w-fit overflow-hidden rounded-md bg-zinc-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" />
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between gap-1 h-full">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                                                    <span className="text-sm text-muted-foreground">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                    onClick={() => removeItem(item.productId, item.variantId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                    <span className="sr-only">Decrease</span>
                                                </Button>
                                                <span className="w-4 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    <span className="sr-only">Increase</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 pr-6 pt-6">
                            <div className="flex items-center justify-between text-lg font-semibold">
                                <span>Subtotal</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Shipping and taxes calculated at checkout.
                            </p>
                            <div className="flex gap-2">
                                <Link href="/cart" className="w-full" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full h-12 rounded-full uppercase tracking-wider">
                                        View Cart
                                    </Button>
                                </Link>
                                <Link href="/checkout" className="w-full" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full h-12 rounded-full uppercase tracking-wider">
                                        Checkout
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

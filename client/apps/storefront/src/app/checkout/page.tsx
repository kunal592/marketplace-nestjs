'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { items, getCartTotal } = useCartStore();
    const subtotal = getCartTotal();
    const shipping = subtotal > 150 ? 0 : 15;
    const taxes = subtotal * 0.08; // Example 8% tax
    const total = subtotal + shipping + taxes;

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('Cart is empty', { description: 'Please add items to your cart before checking out.' });
            return;
        }
        toast.info('Checkout Triggered', { description: 'Razorpay integration flows would trigger here.' });
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center max-w-xl min-h-[50vh] flex flex-col justify-center">
                <h1 className="text-3xl font-bold tracking-tight mb-4 uppercase">Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">You have no items in your shopping cart.</p>
                <Button variant="default" className="w-full rounded-full uppercase" onClick={() => window.location.href = '/products'}>
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 lg:py-24 max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tight uppercase mb-12">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-wider">Shipping Details</CardTitle>
                            <CardDescription>Enter your delivery location</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" placeholder="Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="123 Street Name" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" placeholder="New York" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                                        <Input id="zip" placeholder="10001" required />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full rounded-full h-12 mt-8 uppercase tracking-wider font-semibold">
                                    Complete Payment
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 sticky top-24 bg-zinc-50 dark:bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-wider">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="flex flex-col gap-4">
                                {items.map((item) => (
                                    <li key={`${item.productId}-${item.variantId}`} className="flex items-start gap-4">
                                        <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800">
                                            {item.image && <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                                            <div className="flex justify-between items-end mt-1 text-sm text-muted-foreground">
                                                <span>Qty: {item.quantity}</span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estimated Taxes</span>
                                    <span>${taxes.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

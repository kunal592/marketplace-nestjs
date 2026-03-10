import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t bg-background pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4">Shop</h3>
                        <Link href="/products" className="text-muted-foreground hover:text-foreground text-sm transition-colors">All Products</Link>
                        <Link href="/products" className="text-muted-foreground hover:text-foreground text-sm transition-colors">New Arrivals</Link>
                        <Link href="/products" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Best Sellers</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4">Support</h3>
                        <Link href="/faq" className="text-muted-foreground hover:text-foreground text-sm transition-colors">FAQ</Link>
                        <Link href="/shipping" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Shipping & Returns</Link>
                        <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact Us</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4">Company</h3>
                        <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About Spider Knits</Link>
                        <Link href="/careers" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Careers</Link>
                        <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4">Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter your email" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">© 2026 Spider Knits Marketplace. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="text-xl font-bold tracking-tighter uppercase">SPIDER KNITS.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

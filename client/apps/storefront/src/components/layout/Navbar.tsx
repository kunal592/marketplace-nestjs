import Link from 'next/link';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl tracking-tighter font-bold uppercase transition-transform hover:scale-105">
                            SPIDER KNITS.
                        </Link>
                    </div>

                    <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
                        <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Men</Link>
                        <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Women</Link>
                        <Link href="/products?sort=newest" className="text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Account</span>
                        </Button>
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <ShoppingCart className="h-4 w-4" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
                                <span className="sr-only">Cart</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                            <Menu className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

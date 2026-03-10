import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeaturedProducts } from '@/components/product/FeaturedProducts';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
        {/* Placeholder image representation */}
        <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80')] bg-cover bg-center" />

        <div className="relative z-20 text-center flex flex-col items-center max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 leading-[1.1]">
            Elevate Your <br /> Perspective
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-xl font-light">
            Discover exclusive drops and curated selections from independent brands across the globe.
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 text-sm uppercase tracking-wider font-semibold">
                Shop Now
              </Button>
            </Link>
            <Link href="/vendors">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black rounded-full px-8 text-sm uppercase tracking-wider font-semibold">
                Discover Brands
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold tracking-tight uppercase">Featured Collections</h2>
          <Link href="/categories" className="text-sm font-medium hover:underline underline-offset-4">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Outerwear', 'Footwear', 'Accessories'].map((category, i) => (
            <Link href={`/categories/${category.toLowerCase()}`} key={i} className="group relative h-[400px] overflow-hidden rounded-2xl bg-zinc-100 flex items-center justify-center">
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-zinc-200 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">{category}</h3>
                <span className="inline-block border-b-2 border-white text-white font-medium pb-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Explore
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold tracking-tight uppercase">New Arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm font-medium hover:underline underline-offset-4">
              Shop All
            </Link>
          </div>

          <FeaturedProducts />
        </div>
      </section>
    </div>
  );
}

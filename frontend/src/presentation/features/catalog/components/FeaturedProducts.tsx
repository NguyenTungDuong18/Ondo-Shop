import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { useHomePage } from '../hooks/useHomePage';
import { ShopProductCard } from './ShopProductCard';
type Props = {
  isLoading: NonNullable<ReturnType<typeof useHomePage>>['isLoading'];
  featuredProducts: NonNullable<ReturnType<typeof useHomePage>>['featuredProducts'];
};
export function FeaturedProducts({ isLoading, featuredProducts }: Props) {
  return (<div className="space-y-6">
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
          THE COLLECTION
        </span>
        <h2 className="font-serif-hero text-4xl text-zinc-950 dark:text-zinc-100">Useful beauty.</h2>
      </div>
      <Link
        to="/shop"
        className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
      >
        <span>View all</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    {isLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-zinc-100 dark:bg-[#27272a] h-80 animate-pulse" />
        ))}
      </div>
    ) : featuredProducts.length === 0 ? (
      <div className="bg-white dark:bg-[#1c1c20] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
        <h3 className="font-serif italic text-2xl text-zinc-950 dark:text-zinc-100">Nothing here yet.</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">Try another part of the edit.</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </div>);
}

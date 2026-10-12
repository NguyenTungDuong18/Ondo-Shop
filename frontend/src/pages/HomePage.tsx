import React from 'react';
import { useProductsQuery } from '../hooks/useProductQueries';
import { useCategoriesQuery } from '../hooks/useCategoryQueries';
import { ShopProductCard } from '../components/product/ShopProductCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/common/LinkButton';

export const HomePage: React.FC = () => {
  const { data: productsResponse, isLoading } = useProductsQuery({
    pageIndex: 1,
    pageSize: 8,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: catData } = useCategoriesQuery(true);
  const categories = catData?.data || [];
  const featuredProducts = productsResponse?.data?.items || [];

  return (
    <div className="space-y-20 animate-fade-in pb-20 font-sans">
      {/* === HERO SECTION: EXACT ONDA STUDIO REPLIT COPY & LAYOUT === */}
      <div className="relative border-b border-zinc-200 dark:border-zinc-800 pb-16 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 block">
              Onda / noun / wave, flow, feeling
            </span>

            <h1 className="font-serif-hero text-5xl sm:text-7xl lg:text-8xl leading-[0.92] text-zinc-950 dark:text-zinc-100 tracking-[-0.03em]">
              The everyday, edited with a pulse.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl font-sans leading-relaxed">
              Onda is a quiet collection of useful things — chosen for the way they feel in your hand, and the way they stay in your life.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <LinkButton
                to="/shop"
                variant="primary"
                size="md"
                className="shadow-md"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                Shop the edit
              </LinkButton>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 bg-zinc-100/80 dark:bg-[#1c1c20] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              SELECTED / 01
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed italic font-serif text-lg">
              "We believe a well-made object can change the temperature of a day. The weight of a cup. The drag of a pencil."
            </p>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-500">
              <span>Selected objects</span>
              <span className="font-bold text-zinc-950 dark:text-zinc-100">2026 Edit</span>
            </div>
          </div>
        </div>
      </div>

      {/* === SECTION 2: PHILOSOPHY CALLOUT (Things worth keeping) === */}
      <div className="bg-zinc-950 dark:bg-[#1c1c20] text-white dark:text-zinc-100 rounded-3xl p-8 lg:p-16 border border-zinc-800 dark:border-zinc-700 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 dark:text-amber-400 block">
            THINGS WORTH KEEPING / 01
          </span>
          <h2 className="font-serif-hero text-4xl sm:text-6xl text-white dark:text-zinc-100 leading-tight">
            For the rituals that make a room yours.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 max-w-lg leading-relaxed">
            Every piece has a reason to be here. We look for honest materials, thoughtful makers, and objects that get better with use.
          </p>
        </div>
        <div className="lg:col-span-5 flex justify-end">
          <LinkButton
            to="/shop"
            variant="secondary"
            size="lg"
            className="shadow-xl"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Explore collection
          </LinkButton>
        </div>
      </div>

      {/* === CATEGORIES PILLARS === */}
      {categories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
                CATEGORIES
              </span>
              <h2 className="font-serif-hero text-3xl text-zinc-950 dark:text-zinc-100">Curated spaces</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{categories.length} categories</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="replit-card p-6 flex flex-col justify-between h-40 hover:border-zinc-950 dark:hover:border-zinc-600 cursor-pointer bg-white dark:bg-[#1c1c20] group"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Edit</span>
                <div>
                  <h3 className="font-serif italic text-2xl text-zinc-950 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.productCount !== undefined && (
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">{cat.productCount} objects</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* === FEATURED PRODUCTS SECTION === */}
      <div className="space-y-6">
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
      </div>

      {/* === SECTION 3: CRAFTSMANSHIP & MATERIALS === */}
      <div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
            THE ONDA PHILOSOPHY
          </span>
          <h2 className="font-serif-hero text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-100 leading-tight">
            Lived with, in all the right ways.
          </h2>
        </div>
        <div className="lg:col-span-6 space-y-3">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans font-normal">
            We believe a well-made object can change the temperature of a day. The weight of a cup. The drag of a pencil. The comfort of linen after its hundredth wash.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>Explore our edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

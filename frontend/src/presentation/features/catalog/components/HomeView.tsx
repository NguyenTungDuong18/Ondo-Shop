import { Link } from 'react-router-dom';
import { FeaturedProducts } from './FeaturedProducts';
import { HomeHero } from './HomeHero';
import { HomePhilosophy } from './HomePhilosophy';
import { HomeStory } from './HomeStory';

import type { useHomePage } from '../hooks/useHomePage';
export function HomeView({ model }: { model: ReturnType<typeof useHomePage> }) {
  if (!model) return null;
  const { isLoading, categories, featuredProducts } = model;

  return (
    <div className="space-y-20 animate-fade-in pb-20 font-sans">
      {/* === HERO SECTION: EXACT ONDA STUDIO REPLIT COPY & LAYOUT === */}
      <HomeHero />

      {/* === SECTION 2: PHILOSOPHY CALLOUT (Things worth keeping) === */}
      <HomePhilosophy />

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
      <FeaturedProducts isLoading={isLoading} featuredProducts={featuredProducts} />

      {/* === SECTION 3: CRAFTSMANSHIP & MATERIALS === */}
      <HomeStory />
    </div>
  );

}

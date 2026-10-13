import { ShoppingBag, Star } from 'lucide-react';
import type { useShopProductCard } from '../hooks/useShopProductCard';

export function ShopProductCardView({ model }: { model: ReturnType<typeof useShopProductCard> }) {
  if (!model) return null;
  const { navigate, formatVND, imageSrc, handleAddToCart, product } = model;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="replit-card overflow-hidden cursor-pointer flex flex-col group bg-white dark:bg-[#1c1c20] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-600 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[0.85] bg-zinc-100/90 dark:bg-[#27272a] p-3 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />

        {/* Stock Status Badge */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Quick Add overlay button */}
        {product.stockQuantity > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-9 h-9 bg-zinc-950 text-white rounded-xl shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-800 hover:scale-105 cursor-pointer"
            title="ThÃªm vÃ o giá»"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}

        {/* Rating Badge */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs rounded-md px-2 py-0.5 flex items-center gap-1 border border-zinc-200 font-mono shadow-2xs">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-zinc-950">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            {product.category || 'Collection'}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 font-bold">
            {product.sku}
          </span>
        </div>

        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-100 line-clamp-1 leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors font-sans">
          {product.name}
        </h3>

        <div className="mt-auto pt-2.5 flex items-end justify-between border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block uppercase">Price</span>
            <span className="text-sm font-mono font-bold text-zinc-950 dark:text-zinc-100">{formatVND(product.price)}</span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

}

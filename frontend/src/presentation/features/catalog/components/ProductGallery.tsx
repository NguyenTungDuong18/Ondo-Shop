import type { useProductDetailPage } from '../hooks/useProductDetailPage';
type Props = {
  imageSrc: string | undefined;
  product: NonNullable<NonNullable<ReturnType<typeof useProductDetailPage>>['product']>;
};
export function ProductGallery({ imageSrc, product }: Props) {
  return (<div className="rounded-2xl overflow-hidden bg-zinc-100/90 border border-zinc-200 relative p-4 aspect-[0.85]">
    <img
      src={imageSrc}
      alt={product.name}
      className="w-full h-full object-cover rounded-xl shadow-xs"
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
    <div className="absolute top-6 left-6">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-950 text-white px-3 py-1 rounded-md">
        {product.category || 'Curated'}
      </span>
    </div>
  </div>);
}

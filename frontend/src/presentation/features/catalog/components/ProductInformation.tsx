import { Check, Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import type { useProductDetailPage } from '../hooks/useProductDetailPage';
type Props = {
  product: NonNullable<NonNullable<ReturnType<typeof useProductDetailPage>>['product']>;
  formatVND: NonNullable<ReturnType<typeof useProductDetailPage>>['formatVND'];
  setQuantity: NonNullable<ReturnType<typeof useProductDetailPage>>['setQuantity'];
  quantity: NonNullable<ReturnType<typeof useProductDetailPage>>['quantity'];
  handleAddToCart: NonNullable<ReturnType<typeof useProductDetailPage>>['handleAddToCart'];
  addedNotice: NonNullable<ReturnType<typeof useProductDetailPage>>['addedNotice'];
};
export function ProductInformation({ product, formatVND, setQuantity, quantity, handleAddToCart, addedNotice }: Props) {
  return (<div className="space-y-6">
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          {product.category || 'Selected object'}
        </span>
        <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
          SKU: {product.sku}
        </span>
      </div>

      <h1 className="font-serif-hero text-3xl lg:text-5xl text-zinc-950 leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 mt-3">
        <span className="text-2xl font-mono font-bold text-zinc-950">{formatVND(product.price)}</span>
        <Badge variant={product.stockQuantity > 0 ? 'success' : 'error'}>
          {product.stockQuantity > 0 ? 'In stock' : 'Sold out'}
        </Badge>
      </div>
    </div>

    {/* Description */}
    <div className="space-y-2 border-t border-b border-zinc-100 py-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Object Note</h3>
      <p className="text-xs text-zinc-600 leading-relaxed font-sans font-normal">
        {product.description || 'A quiet collection of useful things — chosen for the way they feel in your hand, and the way they stay in your life.'}
      </p>
    </div>

    {/* Additional Spec details from Replit */}
    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
        <span className="text-[10px] text-zinc-400 uppercase block">Material</span>
        <span className="font-medium text-zinc-900">Honest materials</span>
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
        <span className="text-[10px] text-zinc-400 uppercase block">Batch</span>
        <span className="font-medium text-zinc-900">Small batch release</span>
      </div>
    </div>

    {/* Quantity selector & Add to cart */}
    {product.stockQuantity > 0 && (
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-zinc-500">Quantity:</span>
          <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-none"
              icon={<Minus className="w-3.5 h-3.5" />}
            >
              <span className="sr-only">Decrease</span>
            </Button>
            <span className="px-4 py-1 text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
              className="rounded-none"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAddToCart}
            className="shadow-md"
            icon={addedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
          >
            {addedNotice ? 'Added to bag!' : 'Add to bag'}
          </Button>
        </div>
      </div>
    )}

    {/* === THE ONDA PROMISE SECTION FROM REPLIT === */}
    <div className="space-y-3 pt-4 border-t border-zinc-200">
      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">The Onda promise</h4>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-zinc-950">Good materials</p>
            <p className="text-zinc-500">Chosen for how they age, not just how they arrive.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-zinc-950">Small batches</p>
            <p className="text-zinc-500">A little less stock. A lot more attention.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RefreshCw className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-zinc-950">Easy returns</p>
            <p className="text-zinc-500">Thirty days to decide if it belongs with you.</p>
          </div>
        </div>
      </div>
    </div>
  </div>);
}

import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Spinner } from '../../../shared/components/Loader';
import { ProductGallery } from './ProductGallery';
import { ProductInformation } from './ProductInformation';

import type { useProductDetailPage } from '../hooks/useProductDetailPage';
export function ProductDetailView({ model }: { model: ReturnType<typeof useProductDetailPage> }) {
  if (!model) return null;
  const { navigate, quantity, setQuantity, addedNotice, isLoading, isError, error, product, formatVND, handleAddToCart } = model;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" label="Äang táº£i chi tiáº¿t sáº£n pháº©m..." />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-white p-12 rounded-3xl max-w-lg mx-auto text-center space-y-4 my-12 border border-zinc-200 shadow-sm font-sans">
        <Package className="w-16 h-16 text-zinc-300 mx-auto" />
        <h2 className="font-serif italic text-3xl text-zinc-950">Nothing here yet.</h2>
        <p className="text-xs text-zinc-500 font-sans">
          {error?.message || 'Try another part of the edit.'}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/shop')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to shop
        </Button>
      </div>
    );
  }

  const imageSrc = product.imageUrl ?? undefined;

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-16 font-sans">
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to edit
        </Button>
      </div>

      <div className="bg-white p-6 lg:p-12 rounded-3xl border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Image Showcase */}
        <ProductGallery imageSrc={imageSrc} product={product} />

        {/* Right Info Box */}
        <ProductInformation product={product} formatVND={formatVND} setQuantity={setQuantity} quantity={quantity} handleAddToCart={handleAddToCart} addedNotice={addedNotice} />
      </div>
    </div>
  );

}

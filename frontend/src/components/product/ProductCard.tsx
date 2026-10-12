import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '../../types/product';
import { useCartStore } from '../../store/cartStore';
import { ShoppingBag, Eye } from 'lucide-react';
import { IconButton } from '../common/IconButton';

interface ProductCardProps {
  product: ProductResponse;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };


  const imageSrc = product.imageUrl ?? undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: imageSrc,
      unitPrice: product.price,
      quantity: 1,
      stockQuantity: product.stockQuantity,
    });
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="onda-card overflow-hidden cursor-pointer flex flex-col justify-between group"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div>
        {/* Product Image Container */}
        <div
          className="h-64 w-full overflow-hidden relative flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--surface-raised)' }}
        >
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
              }}
            >
              {product.category || 'Lifestyle'}
            </span>
          </div>

          <div
            className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: 'var(--text-secondary)',
              backdropFilter: 'blur(4px)',
              border: '1px solid var(--border-default)',
            }}
          >
            {product.sku}
          </div>

          {/* Quick Hover Actions overlay */}
          <div
            className="absolute inset-0 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <IconButton
              icon={<ShoppingBag className="w-4 h-4" />}
              onClick={handleAddToCart}
              title="ThÃªm vÃ o giá» hÃ ng"
              size="sm"
              className="shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform"
              style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)' }}
            />
            <IconButton
              icon={<Eye className="w-4 h-4" />}
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
              title="Xem chi tiáº¿t"
              size="sm"
              className="shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform"
              style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 space-y-1.5 font-sans">
          <h3
            className="font-medium text-sm line-clamp-1 transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            {product.name}
          </h3>
          <p className="text-xs line-clamp-2 leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
            {product.description || 'Sáº£n pháº©m cao cáº¥p Ä‘Æ°á»£c cháº¿ tÃ¡c tá»‰ má»‰ theo phong cÃ¡ch tá»‘i giáº£n sang trá»ng.'}
          </p>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div
        className="p-5 pt-0 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <div>
          <span className="text-[9px] font-mono block uppercase" style={{ color: 'var(--text-muted)' }}>Price</span>
          <span className="text-base font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{formatVND(product.price)}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="replit-btn-black px-3.5 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>ThÃªm giá»</span>
        </button>
      </div>
    </div>
  );
};

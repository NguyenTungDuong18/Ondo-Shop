import React from 'react';
import type { ProductResponse } from '../../types/product';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { X, Package, Calendar, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: ProductResponse | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, product, onClose }) => {
  if (!isOpen || !product) return null;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="onda-modal w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--surface-raised)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--text-inverse)' }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="nike-title text-base text-[var(--text-primary)]">Product Details</h3>
              <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{product.sku}</p>
            </div>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose}
            className="rounded-full" icon={<X className="w-5 h-5" />}>
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="nike-title text-xl text-[var(--text-primary)]">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="purple">{product.category || 'General'}</Badge>
                <Badge
                  variant={
                    product.status === 'Active'
                      ? 'success'
                      : product.status === 'Inactive'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {product.status || 'Active'}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>List Price</span>
              <span className="text-xl font-black text-[var(--text-primary)]">{formatVND(product.price)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
          }}>
            <h4 className="text-[10px] font-black uppercase tracking-wider block mb-1"
              style={{ color: 'var(--text-muted)' }}>Product Description</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium"
              style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Layers className="w-5 h-5 shrink-0" style={{ color: 'var(--text-primary)' }} />
              <div>
                <span className="text-[10px] font-bold block uppercase"
                  style={{ color: 'var(--text-muted)' }}>Stock Quantity</span>
                <span className="text-base font-bold text-[var(--text-primary)]">{product.stockQuantity} items</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Calendar className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <span className="text-[10px] font-bold block uppercase"
                  style={{ color: 'var(--text-muted)' }}>Added Date</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {new Date(product.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

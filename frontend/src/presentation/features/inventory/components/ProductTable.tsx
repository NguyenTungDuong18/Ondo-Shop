import { Edit3, Eye, PackageSearch, Trash2 } from 'lucide-react';
import React from 'react';
import type { ProductResponse } from '../../../../domain/models/product';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { Badge } from '../../../shared/components/Badge';
import { IconButton } from '../../../shared/components/IconButton';

interface ProductTableProps {
  products: ProductResponse[];
  onView: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatVND = formatCurrency;

  if (products.length === 0) {
    return (
      <div className="onda-modal rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
        <PackageSearch className="w-12 h-12 text-[var(--text-muted)] opacity-60" />
        <h3 className="font-serif-hero text-base text-[var(--text-primary)]">NO PRODUCTS FOUND</h3>
        <p className="text-xs font-medium max-w-sm text-[var(--text-secondary)]">
          Try adjusting your search query or selecting a different category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="onda-modal rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="onda-table-head text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">PRODUCT NAME</th>
              <th className="py-3.5 px-4">CATEGORY</th>
              <th className="py-3.5 px-4">PRICE</th>
              <th className="py-3.5 px-4">STOCK</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {products.map((product) => {
              const isLowStock = product.stockQuantity <= 10;
              const isOutOfStock = product.stockQuantity === 0;

              return (
                <tr
                  key={product.id}
                  className="onda-table-row-hover transition-colors group font-medium"
                >
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-[var(--text-primary)]">
                    {product.sku}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] max-w-xs truncate">
                    {product.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="purple">{product.category || 'General'}</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                    {formatVND(product.price)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="font-bold"
                      style={{
                        color: isOutOfStock
                          ? 'var(--text-stock-out)'
                          : isLowStock
                            ? 'var(--text-stock-low)'
                            : 'var(--text-stock-good)',
                      }}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
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
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100">
                      <IconButton
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => onView(product)}
                        title="View Details"
                        size="sm"
                      />
                      <IconButton
                        icon={<Edit3 className="w-4 h-4" />}
                        onClick={() => onEdit(product)}
                        title="Edit Item"
                        size="sm"
                      />
                      <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => onDelete(product)}
                        title="Delete Item"
                        variant="danger"
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

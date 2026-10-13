import { Link } from 'react-router-dom';
import { Spinner } from '../../../shared/components/Loader';
import type { useDashboardPage } from '../hooks/useDashboardPage';
type Props = {
  isLoading: NonNullable<ReturnType<typeof useDashboardPage>>['isLoading'];
  products: NonNullable<ReturnType<typeof useDashboardPage>>['products'];
  formatVND: NonNullable<ReturnType<typeof useDashboardPage>>['formatVND'];
};
export function RecentProducts({ isLoading, products, formatVND }: Props) {
  return (<div className="onda-modal p-6 rounded-3xl space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-serif-hero text-base">Recently Updated Products</h3>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Recent inventory items in store</p>
      </div>
      <Link
        to="/products"
        className="text-xs font-bold uppercase tracking-wider transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
      >
        View All →
      </Link>
    </div>

    {isLoading ? (
      <Spinner label="Loading products list from Backend..." />
    ) : products.length === 0 ? (
      <div className="py-8 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>No product data available.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
            <tr>
              <th className="py-2 px-3">SKU</th>
              <th className="py-2 px-3">PRODUCT NAME</th>
              <th className="py-2 px-3">PRICE</th>
              <th className="py-2 px-3">STOCK</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {products.slice(0, 5).map((p) => (
              <tr key={p.id} className="onda-table-row-hover transition-colors">
                <td className="py-3 px-3 font-mono font-bold">{p.sku}</td>
                <td className="py-3 px-3 font-bold">{p.name}</td>
                <td className="py-3 px-3 font-bold">{formatVND(p.price)}</td>
                <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-secondary)' }}>{p.stockQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>);
}

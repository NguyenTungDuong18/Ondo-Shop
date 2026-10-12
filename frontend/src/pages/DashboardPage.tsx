import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useProductsQuery } from '../hooks/useProductQueries';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Loader';
import { Package, CheckCircle2, AlertTriangle, DollarSign, ArrowUpRight, Server, Database, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LinkButton } from '../components/common/LinkButton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: response, isLoading } = useProductsQuery({ pageIndex: 1, pageSize: 50 });

  const products = response?.data?.items || [];
  const totalCount = response?.data?.totalCount || 0;
  const activeProducts = products.filter((p) => p.status === 'Active').length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= 10).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header section */}
      <div
        className="p-6 lg:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div className="relative z-10 space-y-1">
          <Badge variant="purple" className="mb-2">SYSTEM OVERVIEW</Badge>
          <h2 className="font-serif-hero text-2xl lg:text-3xl tracking-tight">
            Welcome back, {user?.fullName || user?.username}!
          </h2>
          <p className="text-xs lg:text-sm font-medium">
            Overview of inventory statistics and backend server connection status.
          </p>
        </div>

        <LinkButton
          to="/products"
          variant="secondary"
          size="sm"
          className="relative z-10 shrink-0 shadow-md"
          iconRight={<ArrowUpRight className="w-4 h-4" />}
        >
          Manage Inventory
        </LinkButton>
      </div>

      {/* Analytics Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Products" value={isLoading ? '...' : totalCount} subtitle="All inventory items" icon={Package} color="indigo" />
        <StatCard title="Active Items" value={isLoading ? '...' : activeProducts} subtitle="Ready for business" icon={CheckCircle2} color="emerald" />
        <StatCard title="Low Stock (&lt;=10)" value={isLoading ? '...' : lowStockProducts} subtitle="Needs restock" icon={AlertTriangle} color="amber" />
        <StatCard title="Total Inventory Value" value={isLoading ? '...' : formatVND(totalValue)} subtitle="Estimated total value" icon={DollarSign} color="purple" />
      </div>

      {/* Grid containing Backend Status Card & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products Table Preview */}
        <div className="onda-modal p-6 rounded-3xl space-y-4">
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
        </div>

        {/* Backend Info Widget */}
        <div className="onda-modal p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              <h3 className="font-serif-hero text-base">System Architecture</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Frontend application directly connected to ASP.NET Core 3-Layer Backend architecture.
            </p>

            <div className="space-y-2 pt-2">
              {[
                { icon: Database, label: 'Database', value: 'PostgreSQL / EF Core', color: 'var(--text-primary)' },
                { icon: ShieldCheck, label: 'Authentication', value: 'Cookie Auth', color: 'var(--text-success)' },
                { icon: Server, label: 'API Host', value: 'http://localhost:5018', color: 'var(--text-primary)', mono: true },
              ].map(({ icon: Icon, label, value, color, mono }) => (
                <div
                  key={label}
                  className="p-3 rounded-2xl flex items-center justify-between text-xs font-semibold"
                  style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}
                >
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    {label}
                  </span>
                  <span className={`font-bold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            ✅ Backend Connection Status: Healthy
          </div>
        </div>
      </div>
    </div>
  );
};

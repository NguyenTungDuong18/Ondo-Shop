import { ArrowUpRight } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { LinkButton } from '../../../shared/components/LinkButton';
import { BackendStatus } from './BackendStatus';
import { InventorySummary } from './InventorySummary';
import { RecentProducts } from './RecentProducts';

import type { useDashboardPage } from '../hooks/useDashboardPage';
export function DashboardView({ model }: { model: ReturnType<typeof useDashboardPage> }) {
  if (!model) return null;
  const { user, isLoading, products, totalCount, activeProducts, lowStockProducts, totalValue, formatVND } = model;

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
      <InventorySummary isLoading={isLoading} totalCount={totalCount} activeProducts={activeProducts} lowStockProducts={lowStockProducts} formatVND={formatVND} totalValue={totalValue} />

      {/* Grid containing Backend Status Card & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products Table Preview */}
        <RecentProducts isLoading={isLoading} products={products} formatVND={formatVND} />

        {/* Backend Info Widget */}
        <BackendStatus />
      </div>
    </div>
  );

}

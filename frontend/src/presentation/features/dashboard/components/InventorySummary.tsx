import { AlertTriangle, CheckCircle2, DollarSign, Package } from 'lucide-react';
import { StatCard } from '../../../shared/components/StatCard';
import type { useDashboardPage } from '../hooks/useDashboardPage';
type Props = {
  isLoading: NonNullable<ReturnType<typeof useDashboardPage>>['isLoading'];
  totalCount: NonNullable<ReturnType<typeof useDashboardPage>>['totalCount'];
  activeProducts: NonNullable<ReturnType<typeof useDashboardPage>>['activeProducts'];
  lowStockProducts: NonNullable<ReturnType<typeof useDashboardPage>>['lowStockProducts'];
  formatVND: NonNullable<ReturnType<typeof useDashboardPage>>['formatVND'];
  totalValue: NonNullable<ReturnType<typeof useDashboardPage>>['totalValue'];
};
export function InventorySummary({ isLoading, totalCount, activeProducts, lowStockProducts, formatVND, totalValue }: Props) {
  return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <StatCard title="Total Products" value={isLoading ? '...' : totalCount} subtitle="All inventory items" icon={Package} color="indigo" />
    <StatCard title="Active Items" value={isLoading ? '...' : activeProducts} subtitle="Ready for business" icon={CheckCircle2} color="emerald" />
    <StatCard title="Low Stock (&lt;=10)" value={isLoading ? '...' : lowStockProducts} subtitle="Needs restock" icon={AlertTriangle} color="amber" />
    <StatCard title="Total Inventory Value" value={isLoading ? '...' : formatVND(totalValue)} subtitle="Estimated total value" icon={DollarSign} color="purple" />
  </div>);
}

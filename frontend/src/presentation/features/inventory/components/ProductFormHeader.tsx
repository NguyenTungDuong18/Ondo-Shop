import { Edit, PackagePlus, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import type { useProductFormModal } from '../hooks/useProductFormModal';
type Props = {
  isEdit: NonNullable<ReturnType<typeof useProductFormModal>>['isEdit'];
  labelStyle: NonNullable<ReturnType<typeof useProductFormModal>>['labelStyle'];
  initialData: NonNullable<ReturnType<typeof useProductFormModal>>['initialData'];
  onClose: NonNullable<ReturnType<typeof useProductFormModal>>['onClose'];
};
export function ProductFormHeader({ isEdit, labelStyle, initialData, onClose }: Props) {
  return (<div className="flex items-center justify-between px-6 py-4"
    style={{
      backgroundColor: 'var(--surface-raised)',
      borderBottom: '1px solid var(--border-default)',
    }}
  >
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-full"
        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--text-inverse)' }}
      >
        {isEdit ? <Edit className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
      </div>
      <div>
        <h3 className="nike-title text-base text-[var(--text-primary)]">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h3>
        <p className="text-xs font-medium" style={labelStyle}>
          {isEdit ? `Updating inventory item ${initialData?.sku}` : 'Fill in the item details below'}
        </p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="xs"
      onClick={onClose}
      className="rounded-full"
      icon={<X className="w-5 h-5" />}
    >
      <span className="sr-only">Close</span>
    </Button>
  </div>);
}

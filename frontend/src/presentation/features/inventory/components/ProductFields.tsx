import { Save } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import type { useProductFormModal } from '../hooks/useProductFormModal';
type Props = {
  handleSubmit: NonNullable<ReturnType<typeof useProductFormModal>>['handleSubmit'];
  onSubmit: NonNullable<ReturnType<typeof useProductFormModal>>['onSubmit'];
  labelStyle: NonNullable<ReturnType<typeof useProductFormModal>>['labelStyle'];
  isEdit: NonNullable<ReturnType<typeof useProductFormModal>>['isEdit'];
  register: NonNullable<ReturnType<typeof useProductFormModal>>['register'];
  inputStyle: NonNullable<ReturnType<typeof useProductFormModal>>['inputStyle'];
  errors: NonNullable<ReturnType<typeof useProductFormModal>>['errors'];
  errorStyle: NonNullable<ReturnType<typeof useProductFormModal>>['errorStyle'];
  categories: NonNullable<ReturnType<typeof useProductFormModal>>['categories'];
  onClose: NonNullable<ReturnType<typeof useProductFormModal>>['onClose'];
  isLoading: NonNullable<ReturnType<typeof useProductFormModal>>['isLoading'];
};
export function ProductFields({ handleSubmit, onSubmit, labelStyle, isEdit, register, inputStyle, errors, errorStyle, categories, onClose, isLoading }: Props) {
  return (<form onSubmit={handleSubmit((values) => onSubmit(values))}
    className="p-6 space-y-4 overflow-y-auto flex-1 font-medium"
    style={{ color: 'var(--text-secondary)' }}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold mb-1" style={labelStyle}>SKU Code *</label>
        <input type="text" disabled={isEdit} {...register('sku')}
          className="nike-input w-full px-4 py-2 text-sm disabled:opacity-50"
          style={inputStyle}
          placeholder="PROD-001"
        />
        {errors.sku && <p className="text-xs mt-1" style={errorStyle}>{errors.sku.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={labelStyle}>Category *</label>
        <select {...register('category')}
          className="nike-input w-full px-4 py-2 text-sm"
          style={{ ...inputStyle, backgroundColor: 'var(--surface-card)' }}
          disabled={categories.length === 0}
        >
          <option value="">Select a category</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        {errors.category && <p className="text-xs mt-1" style={errorStyle}>{errors.category.message}</p>}
      </div>
    </div>

    <div>
      <label className="block text-xs font-bold mb-1" style={labelStyle}>Product Name *</label>
      <input type="text" {...register('name')}
        className="nike-input w-full px-4 py-2 text-sm"
        style={inputStyle}
        placeholder="Enter product title..."
      />
      {errors.name && <p className="text-xs mt-1" style={errorStyle}>{errors.name.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-bold mb-1" style={labelStyle}>Description *</label>
      <textarea rows={3} {...register('description')}
        className="nike-input w-full px-4 py-2 text-sm resize-none"
        style={{ ...inputStyle, borderRadius: 'var(--radius-xl)' }}
        placeholder="Enter item description..."
      />
      {errors.description && <p className="text-xs mt-1" style={errorStyle}>{errors.description.message}</p>}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold mb-1" style={labelStyle}>Price (VND) *</label>
        <input type="number" step="1000" {...register('price', { valueAsNumber: true })}
          className="nike-input w-full px-4 py-2 text-sm"
          style={inputStyle}
        />
        {errors.price && <p className="text-xs mt-1" style={errorStyle}>{errors.price.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={labelStyle}>Stock Quantity *</label>
        <input type="number" {...register('stockQuantity', { valueAsNumber: true })}
          className="nike-input w-full px-4 py-2 text-sm"
          style={inputStyle}
        />
        {errors.stockQuantity && <p className="text-xs mt-1" style={errorStyle}>{errors.stockQuantity.message}</p>}
      </div>
    </div>

    {isEdit && (
      <div>
        <label className="block text-xs font-bold mb-1" style={labelStyle}>Status</label>
        <select {...register('status')}
          className="nike-input w-full px-4 py-2 text-sm"
          style={{ ...inputStyle, backgroundColor: 'var(--surface-card)' }}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="OutOfStock">Out of Stock</option>
        </select>
      </div>
    )}

    <div>
      <label className="block text-xs font-bold mb-1" style={labelStyle}>Image URL (Optional)</label>
      <input type="url" {...register('imageUrl')}
        className="nike-input w-full px-4 py-2 text-sm"
        style={inputStyle}
        placeholder="https://example.com/image.jpg"
      />
      {errors.imageUrl && <p className="text-xs mt-1" style={errorStyle}>{errors.imageUrl.message}</p>}
    </div>

    <div className="pt-4 flex items-center justify-end gap-3"
      style={{ borderTop: '1px solid var(--border-default)' }}
    >
      <Button variant="ghost" size="sm" type="button" onClick={onClose}
        className="rounded-full normal-case tracking-normal">
        Cancel
      </Button>
      <Button variant="primary" size="sm" type="submit" disabled={isLoading}
        className="rounded-full shadow-md"
        icon={<Save className="w-4 h-4" />}>
        {isLoading ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
      </Button>
    </div>
  </form>);
}

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ProductResponse } from '../../types/product';
import { X, Save, PackagePlus, Edit } from 'lucide-react';
import { Button } from '../common/Button';

const productSchema = z.object({
  sku: z.string().min(3, 'SKU code must be at least 3 characters'),
  name: z.string().min(2, 'Product Name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL format').or(z.literal('')).optional().or(z.undefined()),
  status: z.string(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  initialData?: ProductResponse | null;
  isLoading?: boolean;
  categories: string[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  initialData,
  isLoading = false,
  categories,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      category: categories[0] || '',
      imageUrl: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        sku: initialData.sku,
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        category: initialData.category || 'General',
        imageUrl: initialData.imageUrl || '',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        price: 100000,
        stockQuantity: 50,
        category: categories[0] || '',
        imageUrl: '',
        status: 'Active',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const inputStyle = {
    backgroundColor: 'var(--surface-input)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
  };

  const labelStyle = {
    color: 'var(--text-secondary)',
  };

  const errorStyle = {
    color: 'var(--text-danger)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="onda-modal w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(values))}
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
        </form>
      </div>
    </div>
  );
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { type ProductFormValues, productSchema } from '../../../../application/validation/productSchema';
import { type ProductFormModalProps } from '../types/ProductFormModalProps';
export function useProductFormModal({
  isOpen,
  initialData,
  isLoading = false,
  categories,
  onClose,
  onSubmit,
}: ProductFormModalProps) {

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

  const defaultCategory = categories[0] || '';

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
        category: defaultCategory,
        imageUrl: '',
        status: 'Active',
      });
    }
  }, [initialData, reset, isOpen, defaultCategory]);

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
  return { isEdit, register, handleSubmit, errors, inputStyle, labelStyle, errorStyle, isOpen, initialData, isLoading, categories, onClose, onSubmit };
}

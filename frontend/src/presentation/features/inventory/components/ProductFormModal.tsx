import React from 'react';
import { useProductFormModal } from '../hooks/useProductFormModal';
import { type ProductFormModalProps } from '../types/ProductFormModalProps';
import { ProductFormModalView } from './ProductFormModalView';
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  initialData,
  isLoading = false,
  categories,
  onClose,
  onSubmit,
}) => {
  const model = useProductFormModal({ isOpen, initialData, isLoading, categories, onClose, onSubmit });
  return <ProductFormModalView model={model} />;
};

export type { ProductFormValues } from '../../../../application/validation/productSchema';

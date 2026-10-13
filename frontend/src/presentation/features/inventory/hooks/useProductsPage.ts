import { useState } from 'react';
import type { ProductFormValues } from '../../../../application/validation/productSchema';
import type { ProductResponse } from '../../../../domain/models/product';
import { pagination } from '../../../../shared/config/commerce';
import { useCategoriesQuery } from '../../../hooks/useCategoryQueries';
import { useCreateProductMutation, useDeleteProductMutation, useProductsQuery, useUpdateProductMutation } from '../../../hooks/useProductQueries';

export function useProductsPage() {

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = pagination.inventory;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<ProductResponse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductResponse | null>(null);

  const { data: response, isLoading, isFetching } = useProductsQuery({ search: search || undefined, category: category || undefined, pageIndex, pageSize });
  const createMutation = useCreateProductMutation();
  const { data: categoriesResponse } = useCategoriesQuery(true);
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const pagedResult = response?.data;
  const products = pagedResult?.items || [];
  const totalPages = pagedResult?.totalPages || 1;
  const totalCount = pagedResult?.totalCount || 0;

  const availableCategories = categoriesResponse?.data?.map((category) => category.name) || [];

  const handleSearchChange = (val: string) => { setSearch(val); setPageIndex(1); };
  const handleCategoryChange = (val: string) => { setCategory(val); setPageIndex(1); };
  const handleOpenAdd = () => { setEditingProduct(null); setIsFormOpen(true); };
  const handleOpenEdit = (product: ProductResponse) => { setEditingProduct(product); setIsFormOpen(true); };
  const handleOpenView = (product: ProductResponse) => { setViewingProduct(product); setIsDetailOpen(true); };
  const handleOpenDelete = (product: ProductResponse) => { setDeletingProduct(product); setIsDeleteOpen(true); };

  const handleFormSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, data: { name: values.name, description: values.description, price: values.price, stockQuantity: values.stockQuantity, category: values.category, imageUrl: values.imageUrl, status: values.status } },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(
        { sku: values.sku, name: values.name, description: values.description, price: values.price, stockQuantity: values.stockQuantity, category: values.category, imageUrl: values.imageUrl },
        { onSuccess: () => setIsFormOpen(false) }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) deleteMutation.mutate(deletingProduct.id, { onSuccess: () => setIsDeleteOpen(false) });
  };
  return { search, category, pageIndex, setPageIndex, pageSize, isFormOpen, setIsFormOpen, editingProduct, isDetailOpen, setIsDetailOpen, viewingProduct, isDeleteOpen, setIsDeleteOpen, deletingProduct, isLoading, isFetching, createMutation, updateMutation, deleteMutation, products, totalPages, totalCount, availableCategories, handleSearchChange, handleCategoryChange, handleOpenAdd, handleOpenEdit, handleOpenView, handleOpenDelete, handleFormSubmit, handleDeleteConfirm };
}

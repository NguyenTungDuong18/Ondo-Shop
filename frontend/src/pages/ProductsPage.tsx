import React, { useState } from 'react';
import { useCreateProductMutation, useDeleteProductMutation, useProductsQuery, useUpdateProductMutation } from '../hooks/useProductQueries';
import { useCategoriesQuery } from '../hooks/useCategoryQueries';
import type { ProductResponse } from '../types/product';
import { ProductFilterBar } from '../components/product/ProductFilterBar';
import { ProductTable } from '../components/product/ProductTable';
import { Pagination } from '../components/common/Pagination';
import { ProductFormModal } from '../components/product/ProductFormModal';
import type { ProductFormValues } from '../components/product/ProductFormModal';
import { ProductDetailModal } from '../components/product/ProductDetailModal';
import { DeleteConfirmModal } from '../components/product/DeleteConfirmModal';
import { Spinner, TableSkeleton } from '../components/common/Loader';
import { Package } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 8;

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

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            <h2 className="font-serif-hero text-2xl">Products Catalog</h2>
          </div>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage, search, and filter inventory items in your system.
          </p>
        </div>
        {isFetching && !isLoading && (
          <div className="text-xs font-bold animate-pulse flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Spinner size="sm" /> <span>Updating data...</span>
          </div>
        )}
      </div>

      <ProductFilterBar search={search} category={category} categories={availableCategories}
        onSearchChange={handleSearchChange} onCategoryChange={handleCategoryChange} onAddClick={handleOpenAdd} />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          <ProductTable products={products} onView={handleOpenView} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
          <Pagination pageIndex={pageIndex} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages}
            onPageChange={(p) => setPageIndex(p)} />
        </>
      )}

      <ProductFormModal isOpen={isFormOpen} initialData={editingProduct} isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsFormOpen(false)} categories={availableCategories} onSubmit={handleFormSubmit} />
      <ProductDetailModal isOpen={isDetailOpen} product={viewingProduct} onClose={() => setIsDetailOpen(false)} />
      <DeleteConfirmModal isOpen={isDeleteOpen} product={deletingProduct} isLoading={deleteMutation.isPending}
        onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} />
    </div>
  );
};

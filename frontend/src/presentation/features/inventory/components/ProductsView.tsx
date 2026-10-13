import { Package } from 'lucide-react';
import { Spinner, TableSkeleton } from '../../../shared/components/Loader';
import { Pagination } from '../../../shared/components/Pagination';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductFilterBar } from './ProductFilterBar';
import { ProductFormModal } from './ProductFormModal';
import { ProductTable } from './ProductTable';

import type { useProductsPage } from '../hooks/useProductsPage';
export function ProductsView({ model }: { model: ReturnType<typeof useProductsPage> }) {
  if (!model) return null;
  const { search, category, pageIndex, setPageIndex, pageSize, isFormOpen, setIsFormOpen, editingProduct, isDetailOpen, setIsDetailOpen, viewingProduct, isDeleteOpen, setIsDeleteOpen, deletingProduct, isLoading, isFetching, createMutation, updateMutation, deleteMutation, products, totalPages, totalCount, availableCategories, handleSearchChange, handleCategoryChange, handleOpenAdd, handleOpenEdit, handleOpenView, handleOpenDelete, handleFormSubmit, handleDeleteConfirm } = model;

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

}

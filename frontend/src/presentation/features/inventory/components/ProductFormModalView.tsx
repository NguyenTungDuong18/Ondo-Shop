import type { useProductFormModal } from '../hooks/useProductFormModal';
import { ProductFields } from './ProductFields';
import { ProductFormHeader } from './ProductFormHeader';
export function ProductFormModalView({ model }: { model: ReturnType<typeof useProductFormModal> }) {
  if (!model) return null;
  const { isEdit, register, handleSubmit, errors, inputStyle, labelStyle, errorStyle, initialData, isLoading, categories, onClose, onSubmit } = model;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="onda-modal w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <ProductFormHeader isEdit={isEdit} labelStyle={labelStyle} initialData={initialData} onClose={onClose} />

        <ProductFields handleSubmit={handleSubmit} onSubmit={onSubmit} labelStyle={labelStyle} isEdit={isEdit} register={register} inputStyle={inputStyle} errors={errors} errorStyle={errorStyle} categories={categories} onClose={onClose} isLoading={isLoading} />
      </div>
    </div>
  );

}

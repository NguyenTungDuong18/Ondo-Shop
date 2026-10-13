import type { ProductFormValues } from '../../../../application/validation/productSchema';
import type { ProductResponse } from '../../../../domain/models/product';
export interface ProductFormModalProps {
  isOpen: boolean;
  initialData?: ProductResponse | null;
  isLoading?: boolean;
  categories: string[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

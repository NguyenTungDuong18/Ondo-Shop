import { z } from 'zod';
export const productSchema = z.object({
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

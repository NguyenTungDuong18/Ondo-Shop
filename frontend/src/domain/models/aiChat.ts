
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  status: string;
}
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
}

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  createdAt?: Date;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: string | object;
}

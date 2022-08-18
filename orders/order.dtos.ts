import { Address, Basket, Checkout } from '../core/entities';
import { Role } from '../core/enums/roles.enum';
import { BasketStatus } from '../core/enums/basket-status.enum';

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProductDTO {
  name: string;
  price: number;
  desc?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderProductDTO {
  id: string;
  // user: UserDTO | string,
  product: ProductDTO | undefined;
  inBasket: Basket;
  qty: number;
  productPrice: number;
}

export interface OrderProductQueryDTO {
  userId?: string;
  minQty?: number;
  maxQty?: number;
  minPrice?: number;
  maxPrice?: number;
  productId?: string;
  sortBy?: 'productId' | 'qty' | 'price';
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
}

export interface BasketDTO {
  id: string;
  userId: string | null;
  orderProducts: OrderProductDTO[];
  checkout: Checkout;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  status: BasketStatus;
}

export interface BasketQueryDTO {
  minTotalAmount?: number;
  maxTotalAmount?: number;
  updatedFrom?: Date;
  updatedTo?: Date;
  userId?: string;
  status?: BasketStatus;
  sortBy?: 'productId' | 'qty' | 'price';
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
}

export interface AddressDTO {
  id: string;
  user: UserDTO | string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  roomOrOffice?: string;
  door?: string;
  floor?: string;
  rignBell?: string;
  zipCode?: string;
  checkouts: Checkout[];
}

export interface AddressQueryDTO {
  id?: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  roomOrOffice: string;
  door: string;
  floor: string;
  rignBell: string;
  zipCode?: string;
  sortBy?: string;
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
}

export interface CheckoutDTO {
  id: string;
  user: UserDTO | string;
  address: Address;
  basket: Basket;
  comment: string;
}

export interface CheckoutQueryDTO {
  id?: string;
  userId?: string;
  addressId?: string;
  basketId?: string;
  sortBy?: string;
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
}

export interface UserAuth {
  id: string;
  role: Role;
}

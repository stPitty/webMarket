export interface UserDTO {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
}

export interface ProductDTO {
  name: string,
  price: number,
  desc?: string,
  available: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface ReviewDTO {
  id: string,
  rating: number,
  comment: string,
  product: ProductDTO | undefined,
  user:  UserDTO | undefined,
}

export interface ReviewQueryDTO {
  id?: string,
  productId?: string,
  userId?: string,
  sortBy?: 'productId' | 'userId',
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
}
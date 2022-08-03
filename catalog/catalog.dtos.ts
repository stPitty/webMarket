import { Brand, Category, Color, Parameter, ParameterProduct, Review, Tag } from '../core/entities';
import { RatingDTO } from '../core/lib/dto';
import { IsBoolean, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Column, CreateDateColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, UpdateDateColumn } from 'typeorm';
import { BrandService } from './brands/brand.service';

export interface ProductQueryDTO {
  readonly name?: string,
  readonly minPrice?: number,
  readonly maxPrice?: number,
  readonly desc?: string,
  readonly available?: boolean,
  readonly colors?: string | string[],
  readonly categories?: string | string[],
  readonly brands?: string | string[],
  readonly tags?: string | string[],
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly offset?: number;
  readonly limit?: number;
}

export interface TagQueryDTO {
  readonly name?: string,
  readonly products?: string,
  readonly url?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface ParameterQueryDTO {
  readonly name?: string,
  readonly categories?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface ColorQueryDTO {
  readonly name?: string,
  readonly products?: string,
  readonly url?: string,
  readonly code?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

// export interface CategoryDTO {
//   readonly name: string,
//   readonly url: string,
//   readonly parentId?: string,
//   readonly parameters?: Parameter[],
// }

export interface CategoryQueryDTO {
  readonly name?: string,
  readonly url?: string,
  readonly parent?: string,
  readonly children?: string,
  readonly parameters?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly offset?: number;
  readonly limit?: number;
}

export interface BrandQueryDTO {
  readonly name?: string,
  readonly showOnMain?: boolean,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface ProductDTO {
  readonly id: string,
  readonly name: string,
  readonly price: number,
  readonly oldPrice?: number,
  readonly desc: string | null,
  readonly available: boolean,
  readonly createdAt: Date,
  readonly updatedAt: Date,
  readonly images: string | null,
  readonly url: string,
  readonly category: Category,
  readonly brand: Brand,
  readonly colors?: Color[],
  readonly tags?: Tag[],
  readonly rating: RatingDTO | null,
  readonly reviews: Review[] | null,
  readonly parameterProduct: ParameterProduct[] | null,
}


export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsString()
  parentId?: string;

  parameters: Parameter[];

  @IsNotEmpty()
  @IsString()
  url: string;

  parent?: Category
}

export class CreateParameterDTO {
  @IsNotEmpty()
  name: string;
}

export interface ICreateCategoryAnswer {
  categoryId: string,
  parametersIds: string[] | null;
}

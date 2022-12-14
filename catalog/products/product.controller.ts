import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ProductService } from './product.service';
import { Color, Product, Tag } from '../../core/entities';
import { TagService } from '../tags/tag.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isAdmin, verifyToken } from '../../core/middlewares';

@singleton()
@Controller('/products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private tagService: TagService,
  ) { }

  @Get()
  async getProducts(req: Request, resp: Response) {
    const products = await this.productService.getProducts(req.query);

    resp.json(products);
  }

  @Get('priceRange')
  async getProductsPriceRange(req: Request, resp: Response) {
    const products = await this.productService.getProductsPriceRange(req.query);

    resp.json(products);
  }

  @Get('by-url/:url')
  async getProductByUrl(req: Request, resp: Response) {
    const { url } = req.params;
    const product = await this.productService.getProductByUrl(url);

    resp.json(product);
  }


  @Get('productsUnderOneThousand')
  async getProductsUnderOneThousand(req: Request, resp: Response) {
    const products = await this.productService.getProducts({ tags: ['UnderOneThousand'] });

    resp.json(products);
  }

  @Get(':id')
  async getProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const product = await this.productService.getProduct(id);

    resp.json(product);
  }

  @Post()
  @Middleware([verifyToken, isAdmin])
  async createProduct(req: Request, resp: Response) {
    const { tags } = req.body;
    const newProduct = await validation(new Product(req.body));

    tags ? newProduct.tags = await this.tagService.getTagsByIds(tags.map((tag: Tag) => String(tag))) : null;
    const created = await this.productService.createProduct(newProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  @Middleware([verifyToken, isAdmin])
  async updateProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const { tags } = req.body;
    const newProduct = new Product(req.body);

    tags ? newProduct.tags = await this.tagService.getTagsByIds(tags.map((tag: Color) => String(tag))) : null;
    const updated = await this.productService.updateProduct(id, newProduct);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.productService.removeProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}

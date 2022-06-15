import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository, TreeRepository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Category } from '../../core/entities/category.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { CategoryDto } from './category.dto';
import { validation } from '../../core/lib/validator';
import { Color } from '../../core/entities';

@singleton()
export class CategoryService {
  private categoryRepository: Repository<Category>;
  private categoryTreeRepository: TreeRepository<Category>;

  constructor(dataSource: DataSource) {
    this.categoryRepository = dataSource.getRepository(Category);
    this.categoryTreeRepository = dataSource.getTreeRepository(Category);
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({ relations: ['parent', 'children'] });
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: {
            id: Equal(id),
        },
        relations: ['parent', 'children'],
      });

      return category;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getCategoriesTree(): Promise<Category[]> {
    return await this.categoryTreeRepository.findTrees()
  }

  async createCategory(categoryDTO: CategoryDto): Promise<Category> {
    let categoryParent;

    if (categoryDTO.parentId) {
      categoryParent = await this.categoryRepository.findOneOrFail({
        where: {
          id: Equal(categoryDTO.parentId),
        }
      });
    }

    const newCategory = await validation(new Category({
      name: categoryDTO.name,
      url: categoryDTO.url,
      parent: categoryParent
    }));

    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(id: string, categoryDTO: Category) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      return this.categoryRepository.update(id, {
        ...category,
        ...categoryDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeCategory(id: string) {
    try {
      await this.categoryRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      return this.categoryRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}

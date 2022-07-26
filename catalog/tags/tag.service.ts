import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Tag } from '../../core/entities';
import { validation } from '../../core/lib/validator';
import { TagQueryDTO } from '../catalog.dtos';
import { PaginationDTO } from '../../core/lib/dto';

@singleton()
export class TagService {
  private tagRepository: Repository<Tag>;

  constructor(dataSource: DataSource) {
    this.tagRepository = dataSource.getRepository(Tag);
  }

  async getTags(queryParams: TagQueryDTO): Promise<PaginationDTO<Tag>> {
    const {
      name,
      products,
      url,
      sortBy='name',
      orderBy='DESC',
      offset=0,
      limit=10,
    } = queryParams;

    const queryBuilder = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.products', 'product')

    if (name) { queryBuilder.andWhere('tag.name LIKE :name', { name: `%${name}%` }); }
    if (url) { queryBuilder.andWhere('tag.url LIKE :url', { url: `%${url}%` }); }
    if (products) { queryBuilder.andWhere('product.url IN (:...products)', { products: JSON.parse(products) }); }

    const tags = await queryBuilder
      .orderBy(`tag.${sortBy}`, orderBy)
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      rows: tags,
      length: await this.tagRepository.count(),
    }
  }

  async getTag(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOneOrFail({
      where: {
          id: Equal(id),
      },
    });
    return tag;
  }

  async getTagsByIds(ids: string[]): Promise<Tag[]> {

    const tagsPromises = ids.map(async tagId => {
      return this.getTag(tagId);
    })

    return Promise.all(tagsPromises);
  }

  async createTag(tagDTO: Tag): Promise<Tag> {
    const newTag = await validation(new Tag(tagDTO));

    return this.tagRepository.save(newTag);
  }

  async updateTag(id: string, tagDTO: Tag) {
    const tag = await this.tagRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.tagRepository.save({
      ...tag,
      ...tagDTO
    });
  }

  async removeTag(id: string) {
    const tag = await this.tagRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.tagRepository.remove(tag);
  }
}

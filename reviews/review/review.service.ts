import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { ReactionReview, Review } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { CreateReactionDTO, ProductDTO, ReviewDTO, ReviewQueryDTO, UserAuth, UserDTO } from '../reviews.dtos';
import axios from 'axios';
import { scope } from '../../core/middlewares/access.user';
import { Role } from '../../core/enums/roles.enum';
import { PaginationDTO } from '../../core/lib/dto';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { CommentService } from '../comment/comment.service';


@singleton()
export class ReviewService {
  private reviewRepository: Repository<Review>;
  private reactionRepository: Repository<ReactionReview>;

  constructor(dataSource: DataSource, private commentService: CommentService) {
    this.reviewRepository = dataSource.getRepository(Review);
    this.reactionRepository = dataSource.getRepository(ReactionReview);
  }

  async getReviews(queryParams: ReviewQueryDTO): Promise<PaginationDTO<ReviewDTO | Review>> {
    const {
      productId,
      userId,
      showOnMain,
      sortBy = 'productId',
      orderBy = 'DESC',
      merge = 'true',
      offset = 0,
      limit = 10,
    } = queryParams;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.comments', 'comments')
      .leftJoinAndSelect('review.reactions', 'reactions')
      .leftJoinAndSelect('comments.reactions', 'commentReactions');


    if (productId) { queryBuilder.andWhere('review.productId = :productId', { productId: productId }); }
    if (userId) { queryBuilder.andWhere('review.userId = :userId', { userId: userId }); }
    if (showOnMain) { queryBuilder.andWhere('review.showOnMain = :showOnMain', { showOnMain: showOnMain }); }

    queryBuilder
      .orderBy(`review.${sortBy}`, orderBy)
      .skip(offset)
      .take(limit)



    if (merge === 'true') {
      return {
        rows: await this.mergeReviews(queryBuilder),
        length: await queryBuilder.getCount(),
      }
    }

    const reviews = await queryBuilder.getMany();

    for (const review of reviews) {
      const comments = [];
      for (const comment of review.comments) {
        const user = await this.getUserById(comment.userId, '');
        comments.push({
          ...comment,
          user,
        });
      }
      review.comments = comments;
    }

    return {
      rows: reviews,
      length: await queryBuilder.getCount(),
    }
  }

  async getReview(id: string, authToken: string): Promise<ReviewDTO> {
    const review = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.comments', 'comments')
      .leftJoinAndSelect('review.reactions', 'reactions')
      .where('review.id = :id', { id: id })
      .getOneOrFail()

    return await this.mergeReviewUserId(review, authToken)
  }

  async getUserById(id: string, authToken: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`, {
        headers: {
          Authorization: authToken!
        }
      });

      return res.data
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }

  async getProductById(id: string): Promise<ProductDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

      return res.data;
    } catch (e: any) {
      if (e.name !== 'AxiosError') {
        throw new Error(e)
      }
    }
  }

  async getNewReviewId(): Promise<string> {
    const lastElement = await this.reviewRepository.find({
      order: { id: 'DESC' },
      take: 1
    })

    return lastElement[0] ? String(+lastElement[0].id + 1) : String(1);
  }

  async getNewReactionId(): Promise<string> {
    const lastElement = await this.reactionRepository.find({
      order: { id: 'DESC' },
      take: 1
    })

    return lastElement[0] ? String(+lastElement[0].id + 1) : String(1);
  }

  async createReview(newReview: Review, authToken: string): Promise<ReviewDTO> {
    if (!await this.getProductById(newReview.productId)) {
      throw new CustomExternalError([ErrorCode.PRODUCT_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    newReview.id = await this.getNewReviewId();

    const created = await this.reviewRepository.save(newReview);
    const fullReview = await this.getReview(created.id, authToken);

    return fullReview;
  }

  async createReaction(reaction: CreateReactionDTO): Promise<ReactionReview> {
    const review = await this.reviewRepository.findOneOrFail({
      where: {
        id: Equal(reaction.reviewId)
      }
    })

    const newReaction = new ReactionReview({
      id: reaction.id,
      userId: reaction.userId,
      review: review,
      reaction: reaction.reaction
    })

    return this.reactionRepository.save(newReaction)
  }

  async updateReview(id: string, reviewDTO: Review, user: UserAuth) {
    const review = await this.reviewRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    const { productId, ...others } = reviewDTO;

    const newReview = {
      ...review,
      ...others
    }
    await this.isUserReviewOwner(newReview, user);
    await this.reviewRepository.remove(review);

    return this.reviewRepository.save(newReview)
  }

  async removeReview(id: string, user: UserAuth) {
    const review = await this.reviewRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    await this.isUserReviewOwner(review, user)

    return this.reviewRepository.remove(review);
  }

  async removeReaction(id: string, user: UserAuth) {
    const reaction = await this.reactionRepository.findOneOrFail({
      where: {
        id: Equal(id)
      }
    })

    await this.isUserReactionOwner(reaction, user);

    this.reactionRepository.remove(reaction);
    return {
      ...reaction
    }
  }

  isUserReviewOwner(review: Review, user: UserAuth) {
    if (scope(String(review.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  isUserReactionOwner(reaction: ReactionReview, user: UserAuth) {
    if (scope(String(reaction.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  async mergeReviews(queryBuilder: SelectQueryBuilder<Review>) {
    const reviews = await queryBuilder.getMany();
    const result = reviews.map(async (review) => await this.mergeReviewUserId(review, ''))

    return Promise.all(result);
  }

  async mergeReviewUserId(review: Review, authToken: string): Promise<ReviewDTO> {
    return {
      id: review.id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      showOnMain: review.showOnMain,
      product: await this.getProductById(review.productId) ?? review.productId,
      user: await this.getUserById(review.userId, authToken) ?? review.userId,
      comments: review.comments,
      reactions: review.reactions,
      images: review.images,
    }
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Pharmacist, Customer, Prisma } from '@prisma/client';
import { ImagesService } from 'src/context/common/images/images.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Comment,
  PatchCommentDto,
  CreateMerchandiseFromCrawlerDto,
  GetMerchandisesByLikesFilteringAgeDto,
} from './dto/merchandise.dto';

@Injectable()
export class MerchandisesService {
  constructor(
    private prismaService: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async createMerchandise(
    merchandiseCreateWithoutImageInput: Prisma.MerchandiseCreateWithoutImageInput,
    imageToUpload: Express.Multer.File,
  ) {
    // merchandiseHowToConsume upsert
    const existingMerchandiseHowToConsume =
      await this.prismaService.merchandiseHowToConsume.findFirst({
        where: {
          consumption:
            merchandiseCreateWithoutImageInput.merchandiseHowToConsume.create
              .consumption,
        },
      });
    if (existingMerchandiseHowToConsume)
      merchandiseCreateWithoutImageInput.merchandiseHowToConsume = {
        connectOrCreate: {
          where: { id: existingMerchandiseHowToConsume.id },
          create: { consumption: existingMerchandiseHowToConsume.consumption },
        },
      };

    // company upsert
    const existingCompany = await this.prismaService.company.findFirst({
      where: {
        name: merchandiseCreateWithoutImageInput.company.create.name,
      },
    });
    if (existingCompany)
      merchandiseCreateWithoutImageInput.company = {
        connectOrCreate: {
          where: { id: existingCompany.id },
          create: { name: existingCompany.name },
        },
      };

    // create image
    const merchandiseImage = await this.imagesService.create(imageToUpload);

    // created merchandise
    const merchandise = await this.prismaService.merchandise.create({
      data: {
        ...merchandiseCreateWithoutImageInput,
        Image: { connect: { id: merchandiseImage.id } },
      },
    });

    return { result: merchandise, message: '상품 생성 완료' };
  }

  async createMerchandiseFromCrawler(
    createMerchandiseFromCrawlerDto: CreateMerchandiseFromCrawlerDto,
  ) {
    const {
      certification,
      company,
      merchandiseEffects,
      merchandiseHowToConsume,
      name,
      rating,
    } = createMerchandiseFromCrawlerDto;

    // const createdMerchandise =

    // return { result: merchandise, message: '상품 생성 완료' };
  }

  async createMerchandiseEffects(merchandiseId: number, effects: string[]) {
    const promises = [];

    for (const effect of effects) {
      const existingTag = await this.prismaService.tag.findFirst({
        where: { name: effect },
      });
      if (existingTag)
        promises.push(
          this.prismaService.merchandiseEffect.create({
            data: { merchandiseId, tagId: existingTag.id },
          }),
        );
      else {
        const createdTag = await this.prismaService.tag.create({
          data: { name: effect },
        });
        promises.push(
          this.prismaService.merchandiseEffect.create({
            data: { merchandiseId, tagId: createdTag.id },
          }),
        );
      }
    }
    const merchandiseEffects = await Promise.all(promises);

    return {
      result: merchandiseEffects,
      message: `${merchandiseId}번 상품의 효능 생성 완료`,
    };
  }

  async createComment(
    merchandiseId: number,
    createComentDto: Comment,
    Pharmacist: Pharmacist,
  ) {
    const { positive, negative, rating } = createComentDto;
    if (!positive || !negative || !rating)
      throw new InternalServerErrorException();
    const comment = await this.prismaService.comment.create({
      data: {
        merchandiseId,
        positive,
        negative,
        rating,
        pharmacistId: Pharmacist.id,
      },
    });

    return { result: comment, message: '댓글 작성 완료' };
  }

  // async getComments(merchandiseId: number) {
  //   const comment = await this.prismaService.comment.findMany({
  //     where: { merchandiseId },
  //     include: {
  //       Pharmacist: {
  //         select: { userName: true },
  //       },
  //     },
  //   });

  //   return { result: comment, message: `${merchandiseId}번 약 댓글 조회 완료` };
  // }

  async patchComment(
    merchandiseId: number,
    commentId: number,
    patchCommentDto: PatchCommentDto,
    Pharmacist: Pharmacist,
  ) {
    const comment = await this.prismaService.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    if (comment.pharmacistId !== Pharmacist.id)
      throw new UnauthorizedException();
    if (comment.merchandiseId !== merchandiseId)
      throw new BadRequestException();

    const patchedComment = await this.prismaService.comment.update({
      where: { id: comment.id },
      data: patchCommentDto,
      include: {
        Pharmacist: {
          select: { userName: true },
        },
      },
    });

    return { result: patchedComment, message: '댓글 수정 완료' };
  }

  async deleteComment(
    merchandiseId: number,
    commentId: number,
    Pharmacist: Pharmacist,
  ) {
    const comment = await this.prismaService.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    if (comment.pharmacistId !== Pharmacist.id)
      throw new UnauthorizedException();
    if (comment.merchandiseId !== merchandiseId)
      throw new BadRequestException();

    const deletedComment = await this.prismaService.comment.delete({
      where: { id: comment.id },
    });

    return { result: deletedComment, message: '댓글 삭제 완료' };
  }

  async getMerchandise(merchandiseId: number) {
    const merchandise = await this.prismaService.merchandise.findUnique({
      where: { id: merchandiseId },
      include: {
        Comment: true,
        company: true,
        Image: { select: { url: true } },
        MerchandiseEffect: { select: { tag: { select: { name: true } } } },
        merchandiseHowToConsume: { select: { consumption: true } },
        MerchandiseLikes: {
          select: { customer: { select: { _count: true } } },
        },
      },
    });

    return { result: merchandise, message: '약 상세조회 완료' };
  }

  async toggleLike(id: number, customer: Customer) {
    const merchandiseId = id;
    const like = await this.prismaService.merchandiseLikes.findUnique({
      where: {
        merchandiseId_customerId: { customerId: customer.id, merchandiseId },
      },
    });

    const message = like ? '영양제 좋아요 취소 완료' : '영양제 좋아요 완료';

    const updateLike = like
      ? await this.prismaService.merchandiseLikes.delete({
          where: {
            merchandiseId_customerId: {
              customerId: customer.id,
              merchandiseId,
            },
          },
        })
      : await this.prismaService.merchandiseLikes.create({
          data: { customerId: customer.id, merchandiseId },
        });

    return { result: updateLike, message };
  }

  async getMerchandisesByLikesFilteringAge(
    getMerchandisesByLikesFilteringAgeDto: GetMerchandisesByLikesFilteringAgeDto,
  ) {
    const { minAge, maxAge } = getMerchandisesByLikesFilteringAgeDto;
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        MerchandiseLikes: {
          some: { customer: { age: { gte: minAge, lte: maxAge } } },
        },
      },
      include: {
        MerchandiseLikes: { select: { customer: { select: { age: true } } } },
      },
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const count = merchandise.MerchandiseLikes.filter(
        (e) => e.customer.age >= minAge && e.customer.age <= maxAge,
      ).length;

      const _merchandise = Object.assign(merchandise, { likes: count });
      delete _merchandise.MerchandiseLikes;

      _merchandises.push(_merchandise);
    }
    _merchandises = _merchandises.sort((a, b) => b.likes - a.likes);

    return {
      result: _merchandises,
      message: `${minAge}세 ~ ${maxAge}세 인기 상품`,
    };
  }
}

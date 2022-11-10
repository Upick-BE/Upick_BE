import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Pharmacist,
  Customer,
  Prisma,
  Gender,
  Effect,
  Ingredient,
} from '@prisma/client';
import { ImagesService } from 'src/context/common/images/images.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Comment,
  PatchCommentDto,
  GetMerchandisesByLikesFilteringAgeDto,
} from './dto/merchandise.dto';

@Injectable()
export class MerchandisesService {
  constructor(
    private prismaService: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async createMerchandise(
    merchandiseCreateWithoutImageInput: Prisma.MerchandiseCreateWithoutImageInput & {
      merchandiseIngredients: string[];
      merchandiseEffects: string[];
    },
    imageToUpload: Express.Multer.File,
  ) {
    const { merchandiseIngredients, merchandiseEffects } =
      merchandiseCreateWithoutImageInput;
    const quantities: string[] = [];
    const ingredientPromises = [];

    for (
      let i = 0;
      i < merchandiseIngredients.length;
      i += 2 //['비타민C', '최적']
    ) {
      const ingredient = merchandiseIngredients[i];
      const quantity = merchandiseIngredients[i + 1];

      const createdIngredient = this.prismaService.ingredient.upsert({
        where: { name: ingredient },
        create: { name: ingredient },
        update: {},
      });
      ingredientPromises.push(createdIngredient);
      quantities.push(quantity);
    }

    const effectsPromises = [];
    for (const effect of merchandiseEffects) {
      const promise = this.prismaService.effect.upsert({
        where: { name: effect },
        create: { name: effect },
        update: {},
      });
      effectsPromises.push(promise);
    }

    const createdIngredients: Ingredient[] = await Promise.all(
      ingredientPromises,
    );
    const createdEffects: Effect[] = await Promise.all(effectsPromises);

    delete merchandiseCreateWithoutImageInput.merchandiseIngredients;
    delete merchandiseCreateWithoutImageInput.merchandiseEffects;

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
    const createdMerchandise = await this.prismaService.merchandise.create({
      data: {
        ...merchandiseCreateWithoutImageInput,
        Image: { connect: { id: merchandiseImage.id } },
      },
    });

    const merchandiseEffectCreateManyInput = createdEffects.map((e) => {
      return { merchandiseId: createdMerchandise.id, effectId: e.id };
    });
    await this.prismaService.merchandiseEffect.createMany({
      data: merchandiseEffectCreateManyInput,
    });

    for (let i = 0; i < createdIngredients.length; i++) {
      await this.prismaService.merchandiseToIngredient.createMany({
        data: [
          {
            merchandiseId: createdMerchandise.id,
            ingredientId: createdIngredients[i].id,
            quantity: quantities[i],
          },
        ],
      });
    }

    const merchandise = await this.prismaService.merchandise.findUnique({
      where: { id: createdMerchandise.id },
      include: {
        Image: { select: { url: true } },
        company: { select: { name: true } },
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
        merchandiseHowToConsume: { select: { consumption: true } },
        MerchandiseToIngredient: {
          select: { ingredient: { select: { name: true } }, quantity: true },
        },
      },
    });
    return { result: merchandise, message: '상품 생성 완료' };
  }

  async createMerchandiseEffects(merchandiseId: number, effects: string[]) {
    const promises = [];

    for (const effect of effects) {
      const existingEffect = await this.prismaService.effect.findFirst({
        where: { name: effect },
      });
      if (existingEffect)
        promises.push(
          this.prismaService.merchandiseEffect.create({
            data: { merchandiseId, effectId: existingEffect.id },
          }),
        );
      else {
        const createdEffect = await this.prismaService.effect.create({
          data: { name: effect },
        });
        promises.push(
          this.prismaService.merchandiseEffect.create({
            data: { merchandiseId, effectId: createdEffect.id },
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
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
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
    minAge: number,
    maxAge: number,
    keyword?: string,
  ) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        AND: [
          {
            name: {
              contains: keyword,
            },
          },
        ],
        MerchandiseLikes: {
          some: { customer: { age: { gte: minAge, lte: maxAge } } },
        },
      },
      include: {
        MerchandiseLikes: { select: { customer: { select: { age: true } } } },
        Image: { select: { url: true } },
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
      },
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const count = merchandise.MerchandiseLikes.filter(
        (MerchandiseLike) =>
          MerchandiseLike.customer.age >= minAge &&
          MerchandiseLike.customer.age <= maxAge,
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

  async getMerchandisesOrderByLikeCounts(keyword: string) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            MerchandiseEffect: {
              some: { effect: { name: { contains: keyword } } },
            },
          },
          {
            company: { name: { contains: keyword } },
          },
        ],
      },
      take: 10,
      include: {
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
        company: { select: { name: true } },
        MerchandiseLikes: {
          select: {
            merchandise: {
              select: {
                MerchandiseLikes: true,
              },
            },
          },
        },
        Image:{select:{url:true}},
      },
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const count = merchandise.MerchandiseLikes.filter(
        (e) => e.merchandise.MerchandiseLikes,
      ).length;
      const _merchandise = Object.assign(merchandise, { likes: count });
      delete _merchandise.MerchandiseLikes;

      _merchandises.push(_merchandise);
    }
    _merchandises = _merchandises.sort((a, b) => b.likes - a.likes);

    return { result: _merchandises, message: `'${keyword}' 로 검색 완료~!` };
  }

  async getMerchandisesByLikesFilteringGender(
    gender: Gender,
    keyword?: string,
  ) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        AND: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            MerchandiseLikes: {
              some: {
                customer: {
                  gender,
                },
              },
            },
          },
        ],
      },
      take: 10,
      include: {
        MerchandiseLikes: {
          select: { customer: { select: { gender: true } } },
        },
        Image: { select: { url: true } },
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
      },
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const merchanGenders = merchandise.MerchandiseLikes.filter(
        (MerchandiseLike) => MerchandiseLike.customer.gender === gender,
      ).length;

      const _merchandise = Object.assign(merchandise, {
        likes: merchanGenders,
      });

      _merchandises.push(_merchandise);
    }
    _merchandises = _merchandises.sort((a, b) => b.likes - a.likes);

    return {
      result: merchandises,
      message: '성별 좋아요 순위',
    };
  }

  async getMerchandisesByLikesFilteringEffect(keyword?: string) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        OR: [
          {
            MerchandiseEffect: {
              some: {
                effect: {
                  name: {
                    contains: keyword,
                  },
                },
              },
            },
          },
          {
            name: { contains: keyword },
          },
        ],
      },
      take: 10,
      include: {
        MerchandiseLikes: {
          select: {
            merchandise: {
              select: {
                MerchandiseLikes: true,
              },
            },
          },
        },
        Image: { select: { url: true } },
        MerchandiseEffect: { select: { effect: { select: { name: true } } } },
      },
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const count = merchandise.MerchandiseLikes.filter(
        (e) => e.merchandise.MerchandiseLikes,
      ).length;
      const _merchandise = Object.assign(merchandise, { likes: count });
      delete _merchandise.MerchandiseLikes;

      _merchandises.push(_merchandise);
    }
    _merchandises = _merchandises.sort((a, b) => b.likes - a.likes);

    return {
      result: _merchandises,
      message: '효과 별 좋아요 순위 조회 완료!',
    };
  }

  async rankinggetMerchandisesByLikesFilteringByConsider(keyword) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
            },
          },
          {
            MerchandiseEffect: {
              some: {
                merchandise: {
                  MerchandiseEffect: {
                    some: {
                      effect: {
                        name: {
                          contains: keyword,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            MerchandiseToPosting:{
              some:{
                posting:{
                  PostingToConsider:{
                    some:{
                      consider:{
                        name:keyword
                      }
                    }
                  }
                }
              }
            }
          }
        ],
      },
      take: 10,
      include: {
        MerchandiseLikes: {
          select: {
            merchandise: {
              select: {
                MerchandiseLikes: true,
              },
            },
          },
        },
        Image: { select: { url: true } },
        MerchandiseEffect:{select:{effect:{select:{name:true}}},
      },
    }
    });

    let _merchandises = [];
    for (const merchandise of merchandises) {
      const count = merchandise.MerchandiseLikes.filter(
        (e) => e.merchandise.MerchandiseLikes,
      ).length;
      const _merchandise = Object.assign(merchandise, { likes: count });
      delete _merchandise.MerchandiseLikes;

      _merchandises.push(_merchandise);
    }
    _merchandises = _merchandises.sort((a, b) => b.likes - a.likes);

    return { result: _merchandises, message: '건강고민별 조회 완료!' };
  }

  async getrecentlyReadMerchandise() {
    const randomNumbers = [];
    for (let i = 1; i <= 4; i++) {
      randomNumbers.push(Math.floor(Math.random() * 900) + 1);
    }
    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        id: { in: randomNumbers },
      },
      include: {
        MerchandiseEffect:{
          select:{
            effect:{
              select:{
                name:true
              }
            }
          }
        },
        Image: {
          select: {
            url:true
          },
        },
        company: {
          select:{
            name:true
          }
        }
      },
    });

    return {
      result: merchandises,
      message: '최근 조회한 영양제 리스트 조회 완료! (랜덤 영양제)',
    };
  }

  async addMerchandiseToPickUpList(merchandiseId: number, customer: Customer) {
    const randomNumber = Math.round(Math.random() + 1);
    const randomPharmacist = await this.prismaService.pharmacist.findUnique({
      where: { id: randomNumber },
    });
    const pickableAt = new Date();
    pickableAt.setDate(pickableAt.getDate() + 3);

    const createdPickUp = await this.prismaService.customerPickUps.create({
      data: {
        pharmacyAdress: randomPharmacist.pharmacyAddress,
        pharmacyName: randomPharmacist.pharmacyName,
        pickableAt,
        merchandiseId,
        isPicked: false,
        customerId: customer.id,
      },
    });

    return { result: createdPickUp, message: '픽업 예약 완료' };
  }
}

import { Customer, Pharmacist } from '@prisma/client';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostingDto, Posting } from './dto/postings.dto';

@Injectable()
export class PostingsService {
  constructor(private prismaService: PrismaService) {}

  async createPosting(
    createPostingDto: CreatePostingDto,
    pharmacist: Pharmacist,
  ) {
    const { title, content, tags, merchandiseIds } = createPostingDto;

    if (!title.length || !content.length || !merchandiseIds.length)
      throw new InternalServerErrorException();

    const PostingToMerchandiseIdCreateManyInput = merchandiseIds.map(
      (merchandiseId) => {
        return { merchandiseId };
      },
    );

    const createdPosting = await this.prismaService.posting.create({
      data: {
        title,
        content,
        pharmacistId: pharmacist.id,
        MerchandiseToPosting: {
          createMany: { data: PostingToMerchandiseIdCreateManyInput },
        },
      },
    });

    if (tags.length) {
      for (const name of tags) {
        let tag = await this.prismaService.tag.findFirst({
          where: { name },
        });

        if (!tag) {
          tag = await this.prismaService.tag.create({
            data: {
              name,
            },
          });
        }
        await this.prismaService.postingToTag.create({
          data: { postingId: createdPosting.id, tagId: tag.id },
        });
      }
    }

    const _posting = await this.prismaService.posting.findUnique({
      where: { id: createdPosting.id },
      include: {
        PostingToTag: { select: { tag: { select: { name: true } } } },
      },
    });

    return { result: _posting, message: '칼럼작성 완료!' };
  }

  async getPosting(id: number) {
    const posting = await this.prismaService.posting.findUnique({
      //TODO: prisma crud 읽어보기
      where: { id },
      include: {
        pharmacist: {
          select: { userName: true, pharmacyName: true, pharmacyAddress: true },
        },
      },
    });

    return { result: posting, message: `${id}번 칼럼 조회 완료` };
  }

  async getPostings() {
    const postings = await this.prismaService.posting.findMany({
      include: {
        pharmacist: {
          select: { userName: true, pharmacyName: true, pharmacyAddress: true },
        },
      },
    });
    return { result: postings, message: '모든 칼럼 조회 완료' };
  }

  async updatePosting(id: number, posting: Posting, pharmacist: Pharmacist) {
    const { title, content } = posting;

    const _posting = await this.prismaService.posting.findFirst({
      where: { id, pharmacistId: pharmacist.id },
    });

    const updatedPosting = await this.prismaService.posting.update({
      where: { id: _posting.id },
      data: {
        title,
        content,
      },
      include: {
        pharmacist: {
          select: { userName: true, pharmacyName: true, pharmacyAddress: true },
        },
      },
    });

    return { result: updatedPosting, message: '칼럼이 수정되었습니다' };
  }

  async toggleLike(id: number, customer: Customer) {
    const postingId = id;
    const like = await this.prismaService.postingLikes.findUnique({
      where: { postingId_customerId: { customerId: customer.id, postingId } },
    });

    const message = like ? '좋아요 취소 완료' : '좋아요 완료';

    const updatedLike = like
      ? await this.prismaService.postingLikes.delete({
          where: {
            postingId_customerId: { customerId: customer.id, postingId },
          },
        })
      : await this.prismaService.postingLikes.create({
          data: { customerId: customer.id, postingId },
        });

    return { result: updatedLike, message };
  }
}

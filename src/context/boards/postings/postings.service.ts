import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { userInfo } from 'os';
import { PrismaService } from 'src/prisma/prisma.service';
import { Posting } from './dto/postings.dto';

@Injectable()
export class PostingsService {
  constructor(private prismaService: PrismaService) {}

  async createPosting(posting: Posting) {
    const { title, content } = posting;

    if (!title.length || !content.length)
      throw new InternalServerErrorException();

    const createdPosting = await this.prismaService.posting.create({
      data: { title, content, pharmacistId: 7 }, //FIXME: 작성자 아이디로 바꿀것!
    });

    return { result: createdPosting, message: '칼럼작성 완료!' };
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

  async updatePosting(id: number, posting: Posting) {
    const { title, content } = posting;
    const updatedPosting = await this.prismaService.posting.update({
      where: {
        id,
      },
      include: {
        pharmacist: {
          select: { userName: true, pharmacyName: true, pharmacyAddress: true },
        },
      },
      data: {
        title,
        content,
      },
    });
    if (!updatedPosting) {
      throw new InternalServerErrorException();
    }

    return { result: updatedPosting, message: '칼럼이 수정되었습니다' };
  }

  async toggleLike(id: number, customerId: number) {
    const postingId = id;
    let like = await this.prismaService.postingLikes.findUnique({
      where: { postingId_customerId: { customerId, postingId } },
    });

    const message = like ? '좋아요 취소 완료' : '좋아요 완료';

    const updatedLike = like
      ? await this.prismaService.postingLikes.delete({
          where: { postingId_customerId: { customerId, postingId } },
        })
      : await this.prismaService.postingLikes.create({
          data: { customerId, postingId },
        });

    return { result: updatedLike, message };
  }
}

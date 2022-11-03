import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Pharmacist as TPharmacist,
  Customer as TCustomer,
  Prisma,
  Gender,
} from '@prisma/client';
import { ROLE } from 'src/constant/account.constant';
import { Roles } from 'src/decorators/roles.decorator';
import { TransformMerchandisesCreateMerchandiseRequestDtoPipe } from './merchandises.pipe';
import { MerchandisesService } from './merchandises.service';
import {
  Comment,
  PatchCommentDto,
  CreateMerchandiseFromCrawlerDto,
  GetMerchandisesByLikesFilteringAgeDto,
} from './dto/merchandise.dto';
import { Pharmacist } from 'src/decorators/pharmacist.decorator';
import { Customer } from 'src/decorators/customer.decorator';

@Controller('goods/merchandises')
export class MerchandisesController {
  constructor(private readonly merchandisesService: MerchandisesService) {}

  @Get('filtering-by-effect/:tagId')
  rankinggetMerchandisesByLikesFilteringByEffect(
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.merchandisesService.getMerchandisesByLikesFilteringEffect(
      tagId,
    );
  }

  @Post()
  @Roles(ROLE.PHARMACIST)
  @UseInterceptors(FileInterceptor('imageToUpload'))
  createMerchandise(
    @UploadedFile()
    imageToUpload: Express.Multer.File,
    @Body(new TransformMerchandisesCreateMerchandiseRequestDtoPipe())
    merchandiseCreateInput: Prisma.MerchandiseCreateInput,
  ) {
    return this.merchandisesService.createMerchandise(
      merchandiseCreateInput,
      imageToUpload,
    );
  }

  @Get('filtering-by-gender/:gender')
  rankinggetMerchandisesByLikesFilteringByGender(
    @Param('gender')
    gender: Gender,
  ) {
    console.log(gender);
    return this.merchandisesService.getMerchandisesByLikesFilteringGender(
      gender,
    );
  }

  @Get('Filtering-by-Age')
  rankinggetMerchandisesByLikesFilteringAgeByAge(
    @Body()
    getMerchandisesByLikesFilteringAgeDto: GetMerchandisesByLikesFilteringAgeDto,
  ) {
    return this.merchandisesService.getMerchandisesByLikesFilteringAge(
      getMerchandisesByLikesFilteringAgeDto,
    );
  }

  @Post('test')
  @Roles(ROLE.PHARMACIST)
  createMerchandiseFromCrawler(
    @Body() createMerchandiseFromCrawlerDto: CreateMerchandiseFromCrawlerDto,
  ) {
    return this.merchandisesService.createMerchandiseFromCrawler(
      createMerchandiseFromCrawlerDto,
    );
  }

  // @Get('/:merchandiseId/comments')
  // getComments(@Param('merchandiseId', ParseIntPipe) merchandiseId: number) {
  //   return this.merchandisesService.getComments(merchandiseId);
  // }

  @Get('/search/category')
  @Roles(ROLE.CUSTOMER)
  serchingCategoryInMerchandise(@Param('textTyping', ParseIntPipe) textTyping: string) {
    return this.merchandisesService.serchingCategoryInMerchandise(textTyping,);
  }

  @Post('/:merchandiseId/comments')
  @Roles(ROLE.PHARMACIST)
  createComment(
    @Body() createCommentDto: Comment,
    @Pharmacist() pharmacist: TPharmacist,
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
  ) {
    return this.merchandisesService.createComment(
      merchandiseId,
      createCommentDto,
      pharmacist,
    );
  }

  @Patch('/:merchandiseId/comments/:commentId')
  @Roles(ROLE.PHARMACIST)
  patchComment(
    @Body() patchCommentDto: PatchCommentDto,
    @Pharmacist() pharmacist: TPharmacist,
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.merchandisesService.patchComment(
      merchandiseId,
      commentId,
      patchCommentDto,
      pharmacist,
    );
  }

  @Delete('/:merchandiseId/comments/:commentId')
  @Roles(ROLE.PHARMACIST)
  deleteComment(
    @Pharmacist() pharmacist: TPharmacist,
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.merchandisesService.deleteComment(
      merchandiseId,
      commentId,
      pharmacist,
    );
  }

  @Put('/:merchandiseId/like')
  @Roles(ROLE.CUSTOMER)
  toggleLike(
    @Param('merchandiseId', ParseIntPipe) merchandiseId: number,
    @Customer() customer: TCustomer,
  ) {
    return this.merchandisesService.toggleLike(merchandiseId, customer);
  }



  @Get('search/:keyword')
  @Roles(ROLE.CUSTOMER)
  searchMerchandise(@Param('keyword') keyword: string) {
    return this.merchandisesService.searchMerchandise(keyword);
  }

  @Get('/:merchandiseId')
  getMerchandise(@Param('merchandiseId', ParseIntPipe) merchandiseId: number) {
    return this.merchandisesService.getMerchandise(merchandiseId);
  }
}

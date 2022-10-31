//import { Merchandise } from '@prisma/client';
//import { CreateComentDto } from './../../../../../dist/context/boards/coments/dto/coments.dto.d';
export interface CreateMerchandiseDto {
  company: string;
  rating: string;
  name: string;
  certification: string;
  imageToUpload: Express.Multer.File[];
  merchandiseHowToConsume: string;
}

export interface Comment {
  positive: string;
  negative: string;
  rating: number;
}
export interface PatchCommentDto {
  positive: string;
  negative: string;
  rating: number;
}

export interface CreateComentDto extends Comment {
  merchandiseId: number;
}

export interface CreateMerchandiseFromCrawlerDto {
  company: string;
  rating: string;
  name: string;
  certification: string;
  merchandiseHowToConsume: string;
  merchandiseEffects: string[];
}

export interface GetMerchandisesByLikesFilteringAgeDto {
  minAge: number;
  maxAge: number;
}

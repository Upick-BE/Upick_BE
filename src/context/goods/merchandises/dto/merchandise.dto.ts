export interface CreateMerchandiseDto {
  company: string;
  rating: string;
  name: string;
  certification: string;
  imageToUpload: Express.Multer.File[];
  merchandiseHowToConsume: string;
}

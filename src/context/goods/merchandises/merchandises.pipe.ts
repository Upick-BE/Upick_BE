import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMerchandiseDto } from './dto/merchandise.dto';

@Injectable()
export class TransformMerchandisesCreateMerchandiseRequestDtoPipe
  implements
    PipeTransform<
      Omit<CreateMerchandiseDto, 'imageToUpload'>,
      Prisma.MerchandiseCreateInput
    >
{
  transform(
    value: Omit<CreateMerchandiseDto, 'imageToUpload'>,
  ): Prisma.MerchandiseCreateInput {
    const { company, rating, name, certification, merchandiseHowToConsume } =
      value;

    const _rating = parseInt(rating);
    const _certification = certification === 'true' ? true : false;
    const _company: Prisma.CompanyCreateNestedOneWithoutMerchandiseInput = {
      create: { name: company },
    };
    const _merchandiseHowToConsume: Prisma.MerchandiseHowToConsumeCreateNestedManyWithoutMerchandiseInput =
      { create: { consumption: merchandiseHowToConsume } };

    const transformedValue: Prisma.MerchandiseCreateInput = {
      name,
      certification: _certification,
      company: _company,
      rating: _rating,
      MerchandiseHowToConsume: _merchandiseHowToConsume,
    };
    console.log(transformedValue);
    return transformedValue;
  }
}

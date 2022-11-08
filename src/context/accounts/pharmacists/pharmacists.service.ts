import { ROLE } from 'src/constant/account.constant';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PharmacistSignUpDto, SignInDto } from './dto/pharmacist.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload, sign } from 'jsonwebtoken';
import { ImagesService } from 'src/context/common/images/images.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PharmacistsService {
  constructor(
    private prismaService: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async signUp(
    pharmacistSignUpDto: PharmacistSignUpDto,
    imageToUpload: Express.Multer.File,
  ) {
    const {
      email,
      password,
      userName,
      pharmacyName,
      pharmacyAddress,
      pharmacistSignUpSecret,
      counselingEndTime,
      counselingStartTime,
    } = pharmacistSignUpDto;
    const PHARMACIST_PASSWORD_SALT = parseInt(
      process.env.PHARMACIST_PASSWORD_SALT,
    );

    if (pharmacistSignUpSecret !== process.env.PHARMACIST_SIGNUP_SECRET)
      throw new BadRequestException('');

    const isExist = await this.prismaService.pharmacist.findFirst({
      where: { email },
    });
    if (isExist) throw new InternalServerErrorException();

    //create image
    const pharmacistImage = await this.imagesService.create(imageToUpload);

    const hashedPassword = await bcrypt.hash(
      password,
      PHARMACIST_PASSWORD_SALT,
    );

    const _pharmacist = await this.prismaService.pharmacist.create({
      data: {
        email,
        password: hashedPassword,
        userName,
        pharmacyName,
        pharmacyAddress,
        counselingStartTime,
        counselingEndTime,
        Image: { connect: { id: pharmacistImage.id } },
      },
    });
    delete _pharmacist.password;

    return { result: _pharmacist, message: '회원가입 완료' };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const pharmacist = await this.prismaService.pharmacist.findUnique({
      where: { email },
    });

    const validatePassword = await bcrypt.compare(
      password,
      pharmacist.password,
    );

    if (!email || !validatePassword) {
      throw new BadRequestException();
    }

    const payload: JwtPayload = {
      sub: pharmacist.email,
      role: ROLE.PHARMACIST,
    };

    const secret = process.env.PHARMACIST_JWT_SECRET;
    const expiresIn = '3h';
    const token = sign(payload, secret, { expiresIn });

    return { result: token, message: 'Login success' };
  }
  async getHomeTownPharmacists() {
    const getHomeTownPharmacists = await this.prismaService.pharmacist.findMany(
      {
        select: {
          userName: true,
          pharmacyName: true,
          Image: { select: { url: true } },
        },
      },
    );
    return {
      result: getHomeTownPharmacists,
      message: '우리동네 약사 조회 완료!',
    };
    // {result: pharmacist, message: "우리동네 약사 조회 완료"}
  }
}

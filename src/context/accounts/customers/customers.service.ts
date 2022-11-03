import { ROLE } from 'src/constant/account.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignInKakaoRequestDto } from './dto/customer.dto';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload, sign } from 'jsonwebtoken';
import * as qs from 'qs';
import axios from 'axios';
import { Provider, Customer, Gender } from '@prisma/client';
@Injectable()
export class CustomersService {
  constructor(private prismaService: PrismaService) {}  

  async customerSignup(customer: Customer, customerSignUpSecret: string) {
    const { email, password, nickname, age, gender } = customer;
    const CUSTOMER_PASSWORD_SALT = parseInt(process.env.CUSTOMER_PASSWORD_SALT);

    if (customerSignUpSecret !== process.env.CUSTOMER_SIGNUP_SECRET)
      throw new BadRequestException();

    const isExist = await this.prismaService.customer.findFirst({
      where: { email },
    });
    if (isExist) throw new InternalServerErrorException(`It's existing email`);

    const hashedPassword = await bcrypt.hash(password, CUSTOMER_PASSWORD_SALT);
    const _customer = await this.prismaService.customer.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        provider: Provider.local,
        age,
      
        //TODO 성현 : age 랑 gender 는 원래는 필수값이 아니지만 지금은 유저정보 변경 api 가 없어서
        //      우선 필수값으로 넣겠습니다. 추후 회원정보 변경 api 만들시 원래대로 돌려놓겟습니다
      },
    });
    delete _customer.password;

    return { result: _customer, message: '회원가입 완료' };
  }

  async customerSignIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const customer = await this.prismaService.customer.findUnique({
      where: { email },
    });
    if (!customer) throw new BadRequestException('일치하는 아이디 없음');

    const validatePassword = await bcrypt.compare(password, customer.password);

    if (!email || !validatePassword) {
      throw new BadRequestException();
    }
    const token = this.createToken(customer);

    return { result: token, message: '로그인 완료' };
  }

  async signInKakao(signInKakaoRequestDto: SignInKakaoRequestDto) {
    const { code, redirectUri } = signInKakaoRequestDto;

    if (!code || !redirectUri) throw new Error('?');
    const client_id = process.env.CLIENT_ID;
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const data = qs.stringify({
      grant_type: 'authorization_code',
      client_id: client_id,
      redirect_uri: redirectUri,
      code,
    });
    const kakaoTokenOptions = {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    };

    const kakaoToken = await axios
      .post(kakaoTokenUrl, data, kakaoTokenOptions)
      .then((res) => res.data.access_token);

    const kakaoIdUrl = 'https://kapi.kakao.com/v1/user/access_token_info';
    const kakaoIdOptions = {
      headers: { Authorization: `Bearer ${kakaoToken}` },
    };

    const kakaoId = await axios
      .get(kakaoIdUrl, kakaoIdOptions)
      .then((res) => String(res.data.id));

    const customer = await this.prismaService.customer.upsert({
      where: {
        provider_providerId: { provider: Provider.kakao, providerId: kakaoId },
      },
      create: { provider: Provider.kakao, providerId: kakaoId },
      update: {},
    });

    const token = this.createToken(customer);
    return { result: token, message: '카카오 로그인 완료' };
  }

  createToken(customer: Customer) {
    const payload: JwtPayload = {
      sub: customer.email,
      role: ROLE.CUSTOMER,
    };

    const secret = process.env.CUSTOMER_JWT_SECRET;
    const expiresIn = '3h';
    const token = sign(payload, secret, { expiresIn });

    return token;
  }

  async addTakingMedicine(merchandiseId: number, customer: Customer) {
    const addedTakingMedicine = await this.prismaService.takingMedicine.create({
      data: { customerId: customer.id, merchandiseId },
    });

    return { result: addedTakingMedicine, message: '복용중인 약 추가 완료!' };
  }

  async deleteTakingMedicine(merchandiseId: number, customer: Customer) {
    const deletedTakingMedicine =
      await this.prismaService.takingMedicine.delete({
        where: {
          merchandiseId_customerId: { customerId: customer.id, merchandiseId },
        },
      });

    return { result: deletedTakingMedicine, message: '복용중인 약 삭제 완료!' };
  }
}

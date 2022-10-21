import { PrismaService } from 'src/prisma/prisma.service';
import { Customer, SignInDto } from './dto/customer.dto';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
@Injectable()
export class CustomersService {
  constructor(private prismaService: PrismaService) {}
  async customerSignup(customer: Customer, customerSignUpSecret: string) {
    const { email, password, nickname, age, activity, gender, provider } =
      customer;
    const CUSTOMER_PASSWORD_SALT = parseInt(process.env.CUSTOMER_PASSWORD_SALT);

    if (customerSignUpSecret !== process.env.CUSTOMER_SIGNUP_SECRET)
      throw new BadRequestException();

    const isExist = await this.prismaService.customer.findFirst({
      where: { email },
    });
    if (isExist) throw new InternalServerErrorException();

    const hashedPassword = await bcrypt.hash(password, CUSTOMER_PASSWORD_SALT);

    const _customer = await this.prismaService.customer.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        activity,
        gender,
        provider,
        age,
      },
    });
    delete _customer.password

    return { result: _customer, message: '회원가입 완료' };
  }

  async signIn(signInDto : SignInDto) {
    const{ email, password} = signInDto;
    const customer = await this.prismaService.customer.findUnique({
      where: { email },
    });

    const validatePassword = await bcrypt.compare(
      password,
      customer.password,
    );

    if (!email || !validatePassword) {
      throw new BadRequestException();
    }

 
    // const accsetoken = jwt.sign({ email: customer.email,  }, process.env.CUSTOMER_JWT_SECRET, {
    // expiresIn: 60 * 60 * 3, //60초 * 60분 * 3시 이므로, 3시간 유효한 토큰 발급
    // });

    
    return { result: email, message: 'Login success' };
  }
}
//TODO 로그인, 토큰을 쿠키에 담아서 로그인 상태 유지 하기 
// 궁국적으로 약사만 글을 쓸수 있게 
// ci-cd 관심은(깃허브액션 사용) 있으나 도저언!! 
// 로그인까지 해보고 깃헙액션 공부

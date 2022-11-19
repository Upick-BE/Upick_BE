import { ROLE } from 'src/constant/account.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto, UpdateCustomerDto } from './dto/customer.dto';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload, sign } from 'jsonwebtoken';
import * as qs from 'qs';
import axios from 'axios';
import { Provider, Customer, Pharmacist } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prismaService: PrismaService) {}

  async customerSignup(signUpDto: SignUpDto) {
    const { email, password, name, confirmPassword } = signUpDto;
    const CUSTOMER_PASSWORD_SALT = parseInt(process.env.CUSTOMER_PASSWORD_SALT);

    if (password !== confirmPassword) throw new BadRequestException();

    const isExist = await this.prismaService.customer.findUnique({
      where: { email },
    });

    if (isExist) throw new BadRequestException(`It's existing email`);

    const hashedPassword = await bcrypt.hash(password, CUSTOMER_PASSWORD_SALT);
    const _customer = await this.prismaService.customer.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: Provider.local,
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

  async signInKakao(_code: string) {
    const redirectUri = process.env.REDIRECT_URI;

    if (!_code || !redirectUri) throw new Error('?');
    const kakaoTokenUrl = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=0ff7b4e882fe18cced888f1439ca41e2&redirect_uri=${redirectUri}&code=${_code}`;
    // const data = qs.stringify({
    //   grant_type: 'authorization_code',
    //   client_id: '0ff7b4e882fe18cced888f1439ca41e2',
    //   redirect_uri: redirectUri,
    //   code: _code,
    // });
    const kakaoTokenOptions = {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    };

    // console.log(kakaoTokenUrl, data, kakaoTokenOptions);

    const kakaoToken = await axios
      .post(kakaoTokenUrl, {}, kakaoTokenOptions)
      .then((res) => res.data.access_token)
      .catch((e) => {
        console.log('카카오 토큰 발급 에러', e);
      });

    console.log(kakaoToken);

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

  async updateCustomer(
    customer: Customer,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const {
      name,
      age,
      gender,
      isPregnant,
      isBreastFeed,
      considerIds,
      medicineNames,
      stroke,
      heartDisease,
      highBloodPressure,
      diabetes,
      etc,
      takingExcerciseTimePerAWeek,
      memo,
    } = updateCustomerDto;

    const CustomerToConsiderCreateManyInput = considerIds.map((num) => {
      return { considerId: num };
    });
    const merchandiseIdsByMedicineName =
      await this.prismaService.merchandise.findMany({
        where: { name: { in: medicineNames } },
        select: { id: true },
      });
    const takingMedicineCreateManyInput = merchandiseIdsByMedicineName.map(
      (e) => {
        return { merchandiseId: e.id };
      },
    );

    // 기존에 연결된 다대다 테이블 삭제
    await this.prismaService.customerToConsider.deleteMany({
      where: { customerId: customer.id },
    });
    await this.prismaService.takingMedicine.deleteMany({
      where: { customerId: customer.id },
    });

    const updatedCustomer = await this.prismaService.customer.update({
      where: { id: customer.id },
      data: {
        name,
        age,
        gender,
        isPregnant,
        isBreastFeed,
        CustomerToConsider: {
          createMany: { data: CustomerToConsiderCreateManyInput },
        },
        TakingMedicine: {
          createMany: { data: takingMedicineCreateManyInput },
        },
        CustomerDetails: {
          create: {
            stroke,
            diabetes,
            heartDisease,
            highBloodPressure,
            etc,
            takingExcerciseTimePerAWeek,
            memo,
          },
        },
      },
    });

    return { result: updatedCustomer, message: '마이픽 정보 수정 완료' };
  }

  async getCustomer(customer: Customer) {
    const _customer = await this.prismaService.customer.findUnique({
      where: { id: customer.id },
      select: {
        name: true,
        gender: true,
        age: true,
        isBreastFeed: true,
        isPregnant: true,
        CustomerToConsider: { select: { considerId: true } },
        TakingMedicine: { select: { merchandise: true } },
        CustomerDetails: true,
      },
    });
    const randomNumbers = [];
    for (let i = 0; i < 4; i++) {
      const randomNumber = Math.round(Math.random() * 900) + 1;
      randomNumbers.push(randomNumber);
    }
    const merchandises = await this.prismaService.merchandise.findMany({
      where: { id: { in: randomNumbers } },
      select: { id: true, Image: true, company: true, name: true },
    });
    return {
      result: { _customer, merchandises },
      message: '마이픽 조회 완료',
    };
  }

  async getMerchandisesToPick(customerId: number, customer?: Customer) {
    if (customer && customer.id !== customerId)
      throw new UnauthorizedException();

    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        CustomerPickUps: { some: { customerId, isPicked: false } },
      },
      include: { CustomerPickUps: true, Image: { select: { url: true } } },
    });

    return {
      result: merchandises,
      message: `${customerId} customer 픽업할 상품 조회 완료`,
    };
  }

  async getMerchandisesIPicked(customerId: number, customer?: Customer) {
    if (customer && customer.id !== customerId)
      throw new UnauthorizedException();

    const merchandises = await this.prismaService.merchandise.findMany({
      where: {
        CustomerPickUps: { some: { customerId, isPicked: true } },
      },
      include: { CustomerPickUps: true, Image: { select: { url: true } } },
    });

    return {
      result: merchandises,
      message: `${customerId} customer 픽업한 상품 조회 완료`,
    };
  }

  async completePickUp(
    customerId: number,
    merchandiseId: number,
    customer?: Customer,
    pharmacist?: Pharmacist,
  ) {
    const pickup = await this.prismaService.customerPickUps.findFirstOrThrow({
      where: pharmacist
        ? {
            customerId,
            merchandiseId,
            pharmacyAdress: pharmacist.pharmacyAddress,
            pharmacyName: pharmacist.pharmacyName,
          }
        : { customerId, merchandiseId },
    });
    if (customer && pickup.customerId !== customer.id)
      throw new UnauthorizedException();

    const updatedPickup = await this.prismaService.customerPickUps.update({
      where: { id: pickup.id },
      data: { isPicked: true },
    });

    return { result: updatedPickup, message: '픽업 완료 상태로 변경' };
  }

  async cancelPickUp(
    customerId: number,
    merchandiseId: number,
    pharmacist: Pharmacist,
  ) {
    const pickUp = await this.prismaService.customerPickUps.findFirstOrThrow({
      where: {
        customerId,
        merchandiseId,
        pharmacyAdress: pharmacist.pharmacyAddress,
        pharmacyName: pharmacist.pharmacyName,
      },
    });
    const deletedPickup = await this.prismaService.customerPickUps.delete({
      where: { id: pickUp.id },
    });

    return { result: deletedPickup, message: '픽업 취소 완료' };
  }

  async getMerchandisesILike(customer: Customer) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: { MerchandiseLikes: { some: { customerId: customer.id } } },
      take: 10,
      include: { MerchandiseLikes: true, Image: { select: { url: true } } },
    });

    return {
      result: merchandises,
      message: '찜한 상품 조회 완료',
    };
  }

  async getPostingsILike(customer: Customer) {
    const postings = await this.prismaService.posting.findMany({
      where: { postingLikes: { some: { customerId: customer.id } } },
      include: {
        pharmacist: { select: { userName: true, pharmacyName: true } },
      },
    });
    return {
      result: postings,
      message: '찜한 칼럼 조회 완료',
    };
  }

  async getPharmacistsILike(customer: Customer) {
    const pharmacists = await this.prismaService.pharmacist.findMany({
      where: { PharmacistLikes: { some: { customerId: customer.id } } },
      include: { Image: { select: { url: true } }, PharmacistLikes: true },
    });

    return {
      result: pharmacists,
      message: '찜한 약사 조회 완료',
    };
  }

  async getMerchandisesByKeyword(keyword?: string) {
    const merchandises = await this.prismaService.merchandise.findMany({
      where: keyword ? { name: { contains: keyword } } : {},
      select: { name: true },
      take: 10,
    });

    return { result: merchandises, message: `'${keyword}'검색 완료` };
  }

  async getMe(customer: Customer) {
    delete customer.password;
    return { result: customer, message: `토큰 해독 완료` };
  }
}

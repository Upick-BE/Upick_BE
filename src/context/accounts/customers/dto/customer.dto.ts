export interface Customer {
  email: string;
  password: string;
  nickname: string;
  activity: string;
  gender: string;
  provider: string;
  age: number;
}

export interface SignInDto {
  email: string;
  password: string;
}
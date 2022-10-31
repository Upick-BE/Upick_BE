export interface Customer {
  email: string;
  password: string;
  nickname: string;
  age? : number;
  gender? : string;
  
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInKakaoRequestDto {
  code: string;
  redirectUri: string;
}

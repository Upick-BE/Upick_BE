export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInKakaoRequestDto {
  code: string;
  redirectUri: string;
}

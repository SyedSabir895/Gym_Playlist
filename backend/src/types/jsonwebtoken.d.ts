declare module "jsonwebtoken" {
  export interface JwtPayload {
    [key: string]: unknown;
  }

  export interface SignOptions {
    expiresIn?: string | number;
  }

  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string): string | JwtPayload;

  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };

  export default jwt;
}

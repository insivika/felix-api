import joi from "joi";
import { emailSchema } from "./common.js";
export const userOtpSchema = joi
   .object<UserOtpDto>()
   .keys({
      code: joi.string().length(6).required(),
   })
   .required()
   .label("otp");
export const userLoginSchema = joi
   .object<UserLoginDto>()
   .keys({
      identifier: joi.string().email().required(),
      password: joi.string().min(6),
   })
   .required()
   .label("credentials");
export interface UserLoginDto {
   identifier: string;
   password?: string;
}
export interface UserOtpDto {
   code: string;
}
export const userSignupSchema = joi.object<UserSignupDto>().keys({
   username: joi.string().required(),
   firstName: joi.string().required(),
   lastName: joi.string().required(),
   email: emailSchema.required(),
   password: joi.string().min(6).required(),
});
export interface UserSignupDto {
   username: string;
   email: string;
   firstName: string;
   lastName: string;
   password: string;
}
export const authRepliersTokenSchema = joi.object<AuthRepliersTokenDto>().keys({
   token: joi.string().uuid().required(),
});
export interface AuthRepliersTokenDto {
   token: string;
}
export const authEmbedSchema = joi.object<AuthEmbedDto>().keys({
   context: joi.string().required(),
   signature: joi.string().required(),
});
export interface AuthEmbedDto {
   context: string;
   signature: string;
}

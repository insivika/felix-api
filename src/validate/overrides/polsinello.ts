import joi from "joi";
import { contactMessageSchema, contactNameSchema, emailSchema, phoneSchema } from "../../validate/common.js";
export interface ContactContactUsPolsinelloDto {
   name: string;
   email: string;
   message: string;
   phone?: string;
   clientId?: number;
}
export const contactContactusSchema = joi.object<ContactContactUsPolsinelloDto>().keys({
   name: contactNameSchema.required(),
   email: emailSchema.required(),
   message: contactMessageSchema.required(),
   phone: phoneSchema,
   clientId: joi.number()
});
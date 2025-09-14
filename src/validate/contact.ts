import joi from "joi";
import { contactMessageSchema, contactNameSchema, dateSchema, emailSchema, mlsNumberSchema, phoneSchema } from "./common.js";
import { overrides, ContactContactUsPolsinelloDto } from './overrides/overrides.js';
import config from '../config.js';
const customValidators = overrides(config.settings.validationVersion);
export type ContactContactUsDto = {
   name: string;
   email: string;
   phone: string;
   message: string;
   clientId?: number;
} | ContactContactUsPolsinelloDto;
export const contactContactusSchema = customValidators.contactContactusSchema || joi.object<ContactContactUsDto>().keys({
   name: contactNameSchema.required(),
   email: emailSchema.required(),
   phone: phoneSchema.required(),
   message: contactMessageSchema.required(),
   clientId: joi.number()
});

/**
* @openapi
*  components:
*     schemas:
*        ContactScheduleMethod:
*           type: string
*           enum: [InPerson, LiveVideo]
*/
export enum ContactScheduleMethod {
   InPerson = "InPerson",
   LiveVideo = "LiveVideo",
}
export interface ContactScheduleDto {
   name: string;
   email: string;
   phone: string;
   method: ContactScheduleMethod;
   date: string;
   time: string;
   mlsNumber: string;
   clientId?: number;
}
export interface ContactEstimateScheduleDto {
   name: string;
   email: string;
   phone: string;
   date: string;
   time: string;
   estimateId: string;
   clientId?: number;
}
export const contactScheduleSchema = joi.object<ContactScheduleDto>().keys({
   name: contactNameSchema.required(),
   email: emailSchema.required(),
   phone: phoneSchema.required(),
   method: joi.string().valid(...Object.values(ContactScheduleMethod)).required(),
   date: dateSchema.required(),
   time: joi.string().min(4).max(12).required(),
   mlsNumber: mlsNumberSchema.required(),
   // don't we need board id to make sure we can find by mlsNumber?
   clientId: joi.number()
});
export const contactScheduleEstimateSchema = joi.object<ContactEstimateScheduleDto>().keys({
   name: contactNameSchema.required(),
   email: emailSchema.required(),
   phone: phoneSchema,
   date: dateSchema.required(),
   time: joi.string().min(4).max(12).required(),
   estimateId: joi.number().required(),
   clientId: joi.number()
});
export interface ContactRequestInfoDto {
   name: string;
   email: string;
   phone: string;
   message: string;
   mlsNumber: string;
   clientId?: number;
}
export const contactRequestInfoSchema = joi.object<ContactRequestInfoDto>().keys({
   name: contactNameSchema.required(),
   email: emailSchema.required(),
   phone: phoneSchema.required(),
   message: contactMessageSchema.required(),
   mlsNumber: mlsNumberSchema.required(),
   clientId: joi.number()
});
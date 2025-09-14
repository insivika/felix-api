import joi from "joi";
import { VtourLinks, VtourLinkType } from "../repository/vtour.js";
import { UserRole } from "../constants.js";
const vtourSlug = joi.string().regex(/^[a-z0-9-_]+$/).message("Must be valid slug");
export const vtourSlugSchema = joi.object().keys({
   slug: vtourSlug.required()
});
export const vtourLinksSchema = joi.array().items(joi.object().keys({
   type: joi.string().valid(...Object.values(VtourLinkType)),
   title: joi.string(),
   url: joi.string().uri({
      scheme: ["https"]
   })
}));
export interface VtourCreateDto {
   id: string;
   owner_id: number;
   data: VtourLinks[];
}
export const vtourCreateSchema = joi.object<VtourCreateDto>().keys({
   id: vtourSlug.required(),
   owner_id: joi.number().required(),
   data: vtourLinksSchema.required()
});
export interface VtourRemoveDto {
   user_id: number;
   role: UserRole;
   owner_id: number;
   id: string;
}
export const vtourRemoveSchema = joi.object<VtourRemoveDto>().keys({
   user_id: joi.number().required(),
   role: joi.number().valid(...Object.values(UserRole)),
   owner_id: joi.number().required().equal(joi.ref("user_id")).messages({
      "any.only": "You can remove only own vtours"
   }),
   id: vtourSlug.required()
});
export interface VtourUpdateDto {
   id: string;
   data: VtourLinks[];
   user_id: number;
   role: UserRole;
   owner_id: number;
}
export const vtourUpdateSchema = joi.object<VtourUpdateDto>().keys({
   id: vtourSlug.required(),
   data: vtourLinksSchema.required(),
   user_id: joi.number().required(),
   role: joi.number().valid(...Object.values(UserRole)),
   owner_id: joi.number().required().equal(joi.ref("user_id")).messages({
      "any.only": "You can update only own vtours"
   })
});
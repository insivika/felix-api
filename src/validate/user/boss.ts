import joi from "joi";
export const userBossTagSchema = joi.object<UserBossTagDto>().keys({
   tags: joi.array().items(joi.string()).required(),
   userId: joi.number().required()
});
export interface UserBossTagDto {
   tags: string[];
   userId: number;
}
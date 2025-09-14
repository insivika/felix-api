import joi from "joi";
import { RplClientsCreateDto, RplClientsFilterRequest, RplClientsUpdateRequest } from "../services/repliers/clients.js";
import { RplMessagesGetDto, RplMessagesSendDto } from "../services/repliers/messages.js";
import { RplEstimateAddDto } from "../services/repliers/estimate.js";
import { estimateAddSchema, estimateBaseSchema, EstimateGetDto } from "./estimate.js";
export const agentIdSchema = joi.number().required();
export interface AgentCreateClientDto extends RplClientsCreateDto {}
export interface AgentCreateEstimateDto extends RplEstimateAddDto {
   agentId: number;
}
export type AgentGetEstimateDto = EstimateGetDto & {
   agentId: number;
   clientId: number;
};
export interface AgentDeleteEstimateDto {
   agentId: number;
   estimateId: number;
}
export interface AgentSendEstimateDto {
   agentId: number;
   estimateId: number;
}
export interface AgentCreateMessageDto extends RplMessagesSendDto {}
export interface AgentGetMessagesDto extends RplMessagesGetDto {
   clientId: number;
   agentId: number;
   estimateId?: number;
}
export interface AgentUpdateEstimateDto extends Omit<RplEstimateAddDto, "boardId"> {
   agentId: number;
   estimateId: number;
}
export const agentsUpdateEstimateSchema: joi.ObjectSchema<AgentUpdateEstimateDto> = estimateBaseSchema.keys({
   agentId: agentIdSchema,
   estimateId: joi.number().required()
});
export const agentsDeleteEstimateSchema = joi.object<AgentDeleteEstimateDto>({
   agentId: agentIdSchema,
   estimateId: joi.number().required()
});
const agentsCreateClientSchemaKeys = {
   agentId: joi.number().required(),
   email: joi.string().email().required(),
   fname: joi.string(),
   lname: joi.string(),
   phone: joi.string(),
   status: joi.boolean().required(),
   preferences: joi.object({
      email: joi.boolean().default(true),
      sms: joi.boolean().default(true),
      unsubscribe: joi.boolean().default(false)
   }),
   tags: joi.array().items(joi.string())
};
export const agentsCreateClientSchema = joi.object<AgentCreateClientDto>(agentsCreateClientSchemaKeys);
export const agentsCreateEstimateSchema = (estimateAddSchema as joi.ObjectSchema<AgentCreateEstimateDto>).keys({
   agentId: agentIdSchema
});
export const agentsGetEstimateSchema = joi.object<AgentGetEstimateDto>({
   agentId: agentIdSchema,
   clientId: joi.number().required()
});
export const agentsSendEstimateSchema = joi.object<AgentSendEstimateDto>().keys({
   agentId: agentIdSchema,
   estimateId: joi.number().required()
});
export const agentsCreateMessageSchema = joi.object<AgentCreateMessageDto>({
   agentId: agentIdSchema,
   clientId: joi.number().required(),
   content: joi.object({
      message: joi.string().required(),
      links: joi.array().items(joi.string()),
      pictures: joi.array().items(joi.string()),
      listings: joi.array().items(joi.string()),
      searches: joi.array().items(joi.number())
   }).min(1).required()
});
export const agentsGetMessagesSchema = joi.object<AgentGetMessagesDto>({
   agentId: agentIdSchema,
   clientId: joi.number().required(),
   endTime: joi.string(),
   startTime: joi.string(),
   messageId: joi.number(),
   message: joi.string(),
   pageNum: joi.number(),
   resultsPerPage: joi.number(),
   sender: joi.string().allow("agent", "client"),
   status: joi.bool().strict(),
   token: joi.string(),
   estimateId: joi.number()
});
export interface AgentGetBossPeopleDto {
   assignedUserId: number;
   agentId: number;
   tags?: string;
}
export const agentGetBossPeopleSchema = joi.object<AgentGetBossPeopleDto>({
   assignedUserId: joi.number().required().messages({
      'any.required': "You need an account in FollowUpBoss, contact administroator to create one"
   }),
   agentId: agentIdSchema,
   tags: joi.string()
});
export interface AgentGetClientsDto extends RplClientsFilterRequest {
   agentId: number;
}
export const agentGetClientsSchema = joi.object<AgentGetClientsDto>({
   agentId: agentIdSchema,
   clientId: joi.number(),
   condition: joi.string().allow("EXACT", "CONTAINS"),
   email: joi.string().email(),
   fname: joi.string(),
   lname: joi.string(),
   keywords: joi.string(),
   operator: joi.string().allow("AND", "OR"),
   pageNum: joi.number().default(1),
   resultsPerPage: joi.number().default(100),
   tags: joi.string(),
   phone: joi.number(),
   status: joi.boolean(),
   showSavedSearches: joi.boolean().default(false),
   showEstimates: joi.boolean().default(true)
});
export const agentGetSingleClientsSchema = joi.object<AgentGetClientsDto>({
   agentId: agentIdSchema,
   clientId: joi.number().required(),
   showSavedSearches: joi.boolean().default(false),
   showEstimates: joi.boolean().default(true)
});
export interface AgentUpdateClientDto extends RplClientsUpdateRequest {}
export const agentUpdateClientSchema = (agentsCreateClientSchema.fork(Object.keys(agentsCreateClientSchemaKeys), schema => schema.optional()) as joi.ObjectSchema<AgentUpdateClientDto>).keys({
   clientId: joi.number().required()
});
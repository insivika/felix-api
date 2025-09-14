import { injectable } from "tsyringe";
import RepliersBase, { ApiRequest, ApiResponse } from "./base.js";
export type RplMessagesSender = "agent" | "client";
export type RplMessagesSource = "bot" | string;
export type RplMessagesSendingStatus = "sent" | "pending";
export interface RplMessagesSendDto {
   sender: RplMessagesSender;
   agentId: number;
   clientId: number;
   content: Partial<{
      subject?: string;
      listings: string[];
      searches: number[];
      message: string;
      links: string[];
      pictures: string[];
   }>;
}
export interface RplMessagesSingleMessage extends RplMessagesSendDto {
   messageId: number;
   source: RplMessagesSource;
   token: string;
   delivery: {
      scheduleDateTime: string | null;
      sentDateTime: string; // | null?
      status: RplMessagesSendingStatus;
   };
}
export interface RplMessagesSendRequest extends RplMessagesSendDto, ApiRequest {}
export interface RplMessagesSendResponse extends ApiResponse {}
export interface RplMessagesGetDto {
   clientId?: number;
   agentId?: number;
   endTime?: string;
   startTime?: string;
   messageId?: number;
   message?: string;
   pageNum?: number;
   resultsPerPage?: number;
   sender?: RplMessagesSender;
   status?: RplMessagesSendingStatus;
   token?: string;
}
export interface RplMessagesGetRequest extends RplMessagesGetDto, ApiRequest {}
export interface RplMessagesGetResponse extends ApiResponse {
   page: number;
   numPages: number;
   pageSize: number;
   count: number;
   messages: Array<RplMessagesSingleMessage>;
}
@injectable()
export default class RepliersMessages extends RepliersBase {
   public async send(params: RplMessagesSendRequest) {
      return this.request<RplMessagesSendResponse>("POST", "/messages", {}, params);
   }
   public async get(params: RplMessagesGetRequest) {
      return this.request<RplMessagesGetResponse>("GET", "/messages", params);
   }
}
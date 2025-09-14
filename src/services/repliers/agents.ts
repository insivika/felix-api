import { injectable } from "tsyringe";
import RepliersBase, { ApiRequest, ApiResponse } from "./base.js";
export interface RplAgentsFilterRequest extends ApiRequest {
   agentId?: number;
   boardId?: number;
   brokerage?: string;
   designation?: string;
   email?: string;
   fname?: string;
   lname?: string;
   phone?: string;
   status?: boolean;
   externalId?: string;
}
export interface RplAgentsFilterResponse extends ApiResponse {
   agents: RplAgentsAgent[];
}
export interface RplAgentLocation {
   latitude: string;
   longitude: string;
}
export interface RplAgentsAgent {
   status: boolean;
   agentId: number;
   fname: string;
   lname: string;
   phone: string;
   email: string;
   proxyPhone: string;
   proxyEmail: string;
   avatar: string | null;
   brokerage: string;
   designation: string;
   location: RplAgentLocation | null;
   externalId: string | null;
   data: Record<string, unknown> | null;
}
export interface RplAgentsCreateRequest extends ApiRequest {
   fname: string;
   lname: string;
   phone: string;
   email: string;
   brokerage: string;
   designation: string;
   avatar?: string;
   location?: RplAgentLocation;
   status?: boolean;
   externalId?: string;
   data?: Record<string, unknown>;
}
export interface RplAgentsCreateResponse extends ApiResponse {
   agent: RplAgentsAgent;
}
export interface RplAgentsUpdateRequest extends Partial<RplAgentsCreateRequest> {
   agentId: number;
}
export interface RplAgentsUpdateResponse extends ApiResponse {
   agent: RplAgentsAgent;
}
@injectable()
export default class RepliersAgents extends RepliersBase {
   filter(params: RplAgentsFilterRequest) {
      return this.request<RplAgentsFilterResponse>("GET", "/agents", params);
   }
   get(agentId: number) {
      return this.request<RplAgentsAgent>("GET", `/agents/${agentId}`);
   }
   create(params: RplAgentsCreateRequest) {
      return this.request<RplAgentsCreateResponse>("POST", "/agents", {}, params);
   }
   update(params: RplAgentsUpdateRequest) {
      const {
         agentId,
         ...updates
      } = params;
      return this.request<RplAgentsUpdateResponse>("PATCH", `/agents/${agentId}`, {}, updates);
   }
}
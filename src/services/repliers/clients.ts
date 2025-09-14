import { injectable } from "tsyringe";
import RepliersBase, { ApiRequest, ApiResponse } from "./base.js";
import { RplEstimateSingle } from "./estimate.js";
export interface RplClientsClient {
   clientId: number;
   agentId: number;
   fname: string;
   lname: string;
   phone: string;
   email: string;
   proxyEmail: string;
   status: boolean;
   lastActivity: null | unknown;
   tags: string;
   preferences: {
      email: boolean;
      sms: boolean;
      unsubscribe: boolean;
      whatsapp: boolean;
   };
   expiryDate: null | unknown;
   searches?: unknown[];
   createdOn: string;
   estimates?: RplEstimateSingle[];
   externalId: string | null;
   data: Record<string, unknown>;
}
export interface RplClientsCreateDto {
   agentId: number;
   fname?: string;
   lname?: string;
   phone?: string | undefined;
   email?: string | undefined;
   status?: boolean;
   preferences?: {
      email?: boolean;
      sms?: boolean;
      unsubscribe?: boolean;
   };
   tags?: string[];
   externalId?: number;
}
export interface RplClientsCreateRequest extends RplClientsCreateDto, ApiRequest {}
export interface RplClientsCreateResponse extends ApiResponse, RplClientsClient {}
export interface RplClientsUpdateDto extends Omit<RplClientsCreateDto, "email"> {
   clientId: number;
}
export interface RplClientsUpdateRequest extends RplClientsUpdateDto, ApiRequest {}
export interface RplClientsUpdateResponse extends ApiResponse {}
export interface RplClientsDeleteResponse extends ApiResponse {}
export interface RplClientsGetResponse extends ApiResponse, RplClientsClient {}
export interface RplClientsFilterDto {
   agentId?: number;
   clientId?: number;
   email?: string | undefined;
   fname?: string;
   keywords?: string;
   lname?: string;
   phone?: string | undefined;
   status?: boolean;
   condition?: "EXACT" | "CONTAINS";
   operator?: "OR" | "AND";
   pageNum?: number;
   resultsPerPage?: number;
   tags?: string;
   showSavedSearches?: boolean;
   showEstimates?: boolean;
   externalId?: string;
}
export interface RplClientsFilterRequest extends RplClientsFilterDto, ApiRequest {}
export interface RplClientsFilterResponse extends ApiResponse {
   page: number;
   numPages: number;
   pageSize: number;
   count: number;
   clients: Array<RplClientsClient>;
}
export interface RplClientsGetTagsResponse extends ApiResponse {}
export interface RplClientsRenameTagDto {
   tag: string;
   label: string;
}
export interface RplClientsRenameTagRequest extends RplClientsRenameTagDto, ApiRequest {}
export interface RplClientsRenameTagResponse extends ApiResponse {}
@injectable()
export default class RepliersClients extends RepliersBase {
   create(params: RplClientsCreateRequest) {
      return this.request<RplClientsCreateResponse>("POST", `/clients`, {}, params);
   }
   update(params: RplClientsUpdateRequest) {
      const {
         clientId,
         ...updates
      } = params;
      return this.request<RplClientsUpdateResponse>("PATCH", `/clients/${clientId}`, {}, updates);
   }
   delete(clientId: number) {
      return this.request<RplClientsDeleteResponse>("DELETE", `/clients/${clientId}`);
   }
   get(clientId: number) {
      return this.request<RplClientsGetResponse>("GET", `/clients/${clientId}`);
   }
   filter(params: RplClientsFilterRequest) {
      return this.request<RplClientsFilterResponse>("GET", "/clients", params);
   }
   getTags() {
      return this.request<RplClientsGetTagsResponse>("GET", "/clients/tags");
   }
   renameTag(params: RplClientsRenameTagRequest) {
      return this.request<RplClientsRenameTagResponse>("PATCH", `/clients/tags/${params.tag}`, {}, {
         label: params.label
      });
   }
}
import axios, { Axios, AxiosRequestConfig } from "axios";
import { inject, injectable } from "tsyringe";
import type { AppConfig } from "../config.js";
import { ApiError } from "../lib/errors.js";
export type ApiMethod = "GET";
export interface ApiRequest {
   [key: string]: unknown;
}
export interface ApiResponse {
   [key: string]: unknown;
}
export interface GoogleAutocompleteSuggestRequest extends ApiRequest {
   input: string;
   types: string; // address
   language: string;
   location: `${string},${string}`;
   components: string; // 'country:ca'
   radius: number; // 10000
   sessiontoken: string;
   strictbounds?: boolean; // true
   locationrestriction?: string;
}
export interface GoogleAutocompleteResponse extends ApiResponse {
   status: string; // 'OK',
   predictions: {
      description: string;
      matched_substrings: {
         length: number;
         offset: number;
      }[];
      place_id: string;
      reference: string;
      structured_formatting: {
         main_text: string;
         main_text_matched_substrings: {
            length: number;
            offset: number;
         }[];
         secondary_text: string;
      };
      terms: {
         offset: number;
         value: string;
      }[];
      types: string[];
   }[];
}
@injectable()
export default class GoogledService {
   private axios: Axios;
   constructor(@inject("config")
   private config: AppConfig) {
      this.axios = axios.create({
         baseURL: this.config.googlemaps.base_url,
         timeout: this.config.googlemaps.timeout_ms,
         headers: {
            "Content-Type": "application/json"
         },
         params: {
            key: this.config.googlemaps.key
         }
      });
   }
   private async request<Response>(method: ApiMethod, url: string, params: ApiRequest): Promise<Response> {
      let options: AxiosRequestConfig = {
         method,
         url
      };
      options = {
         ...options,
         params
      };
      return this.axios.request(options).then(axiosResponse => {
         // TODO: error handling
         return axiosResponse.data;
      }).catch(e => {
         throw new ApiError("Google API error", e.response.status, e.response.data);
      });
   }
   public async autocomplete(params: GoogleAutocompleteSuggestRequest) {
      return this.request<GoogleAutocompleteResponse>("GET", "/place/autocomplete/json", params);
   }
}
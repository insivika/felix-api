import axios, { AxiosRequestConfig } from "axios";
import type { AppConfig } from "../../config.js";
import { inject, injectable } from "tsyringe";
import { ApiError } from "../../lib/errors.js";
import _debug from "debug";
import pThrottle from "p-throttle";
import { XFFProvider } from "../../lib/xffprovider.js";
const debug = _debug("repliers:services:repliers");
export type ApiMethod = "POST" | "GET" | "PATCH" | "DELETE";
export interface ApiRequest extends Record<string, unknown> {}
export interface ApiResponse extends Record<string, unknown> {}
export interface ApiBody extends Record<string, unknown> {}
@injectable()
export default class RepliersBase {
   private throttledRequest;
   constructor(@inject("config")
   private config: AppConfig, @inject('XForwardedFor')
   private xff: XFFProvider) {
      const {
         axiosInstance,
         throttler
      } = this.createAxios(this.config.repliers.api_key);
      this.throttledRequest = throttler(axiosInstance.request);
   }
   createAxios(key: string) {
      const axiosInstance = axios.create({
         baseURL: this.config.repliers.base_url,
         timeout: this.config.repliers.timeout_ms,
         headers: {
            "REPLIERS-API-KEY": key,
            "Content-Type": "application/json"
         },
         paramsSerializer: {
            indexes: null
         }
      });
      const throttler = pThrottle({
         limit: this.config.repliers.limit,
         interval: this.config.repliers.interval
      });
      return {
         axiosInstance,
         throttler
      };
   }

   // we can call throttler(axiosInstance.request) inside switchKey method
   // but this will require adding typings for private throttledRequest which is currently inferred perfectly
   // So this is just lazy way to avoid adding typings
   switchKey(key: string) {
      const {
         axiosInstance,
         throttler
      } = this.createAxios(key);
      this.throttledRequest = throttler(axiosInstance.request);
   }
   protected async request<Response>(method: ApiMethod, url: string, query?: ApiRequest, body?: ApiBody): Promise<Response> {
      const options: AxiosRequestConfig = {
         method,
         url,
         params: query,
         data: body
      };

      // And finally
      options.headers = this.xff.isEnabled() ? {
         'x-repliers-forwarded-for': this.xff.getHeader()
      } : {};
      debug(options);
      return this.throttledRequest(options).then(axiosResponse => {
         debug('HTTP response', {
            status: axiosResponse.status,
            dataPreview: JSON.stringify(axiosResponse.data)?.slice(0, 1500) // log only first 1500 chars
         });
         return axiosResponse.data;
      }).catch(e => {
         debug(e.response);
         throw new ApiError("Repliers API error", e.response?.status, e.response?.data);
      });
   }
}
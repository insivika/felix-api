import { container } from "tsyringe";
import { AppConfig } from "../config.js";
import { Context, Next } from "koa";
import _debug from 'debug';
const debug = _debug("repliers:lib:xffprovider");
declare module 'koa' {
   interface DefaultState {
      'enable.xff': boolean;
   }
}
export function sanitizeIpAddr(ip: string): string {
   return ip.replace(/::ffff:/g, '').trim();
}
export class XFFProvider {
   private xff: string;
   private shouldProxy = false;
   constructor(ctx: Context) {
      debug('Creating XFFProvider with x-forwarded-for %O', {
         xff: ctx.get('x-forwarded-for'),
         xffToken: ctx.get('X-Forwarded-For-Token')
      });
      this.xff = this.getClientIp(ctx);
      if (this.isSsgRequest(ctx)) {
         this.shouldProxy = false;
      } else {
         this.shouldProxy = ctx.state['enable.xff'];
      }
      const xffHeader = ctx.get('x-forwarded-for');
      debug(`x-forwarded-for: ${xffHeader}, passed downstream: ${this.xff}`);
   }
   isEnabled() {
      return this.shouldProxy && container.resolve<AppConfig>('config').repliers.proxy_xff && this.xff.length > 0;
   }
   getHeader() {
      return this.xff;
   }
   private getClientIp(ctx: Context): string {
      const xForwardedFor = ctx.get('x-forwarded-for');
      if (!xForwardedFor || typeof xForwardedFor !== 'string') {
         return '';
      }
      const ips = xForwardedFor.split(',');
      const lastIndex = ips.length - 1;
      const lastIp = typeof ips[lastIndex] === 'string' ? sanitizeIpAddr(ips[lastIndex]) : '';
      switch (true) {
         case this.isSsrRequest(ctx):
            return this.getClientIpBehindSSR(ips);
         case this.isSsgRequest(ctx):
            return '';
         default:
            return lastIp;
      }
   }
   private isSsrRequest(ctx: Context): boolean {
      const nextToken = ctx.get('X-Forwarded-For-Token');
      const ssrToken = container.resolve<AppConfig>('config').xff.ssr_token;
      debug(`[isSsrRequest]: nextToken: ${nextToken}, expectedToken: ${ssrToken}`);
      return !!nextToken && nextToken === ssrToken;
   }
   private isSsgRequest(ctx: Context): boolean {
      const nextToken = ctx.get('X-Forwarded-For-Token');
      const ssgToken = container.resolve<AppConfig>('config').xff.ssg_token;
      debug(`[isSsgRequest]: nextToken: ${nextToken}, expectedToken: ${ssgToken}`);
      return !!nextToken && nextToken === ssgToken;
   }
   private getClientIpBehindSSR(ips: string[]): string {
      let offset = container.resolve<AppConfig>('config').xff.ssr_ipaddr_offset;
      while (0 < offset) {
         const desiredIndex = ips.length - offset;
         if (desiredIndex < 0 || typeof ips[desiredIndex] !== 'string') {
            debug(`[getClientIpBehindSSR]: offset ${offset} -> ${desiredIndex} is out of bounds for ips: ${ips}. Decreasing offset`);
            offset -= 1;
            continue;
         }
         return sanitizeIpAddr(ips[desiredIndex]);
      }
      return '';
   }
   static getMiddleware() {
      return async (ctx: Context, next: Next) => {
         ctx.state.container.register<XFFProvider>("XForwardedFor", {
            useFactory: () => {
               return new XFFProvider(ctx);
            }
         });
         await next();
      };
   }
}
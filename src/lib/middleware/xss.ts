import { Middleware, Next } from 'koa';
import _ from 'lodash';
import xss from 'xss';
import _debug from 'debug';
const debug = _debug('repliers:middleware:xss');
type Sanitizable<T> = string | Array<Sanitizable<T>> | {
   [key: string]: Sanitizable<T>;
};
function sanitize<T extends Sanitizable<T>>(options: XSS.IFilterXSSOptions, data: T): T {
   if (typeof data === "string") {
      return xss(data, options) as T;
   }
   if (Array.isArray(data)) {
      return data.map(item => sanitize(options, item)) as T;
   }
   if (typeof data === "object" && data !== null) {
      const sanitizedData: {
         [key: string]: Sanitizable<T>;
      } = {};
      for (const [key, value] of Object.entries(data)) {
         sanitizedData[key] = sanitize(options, value as Sanitizable<T>);
      }
      return sanitizedData as T;
   }
   return data;
}
export default (options = {}) => {
   return async (ctx: Middleware, next: Next) => {
      ["body", "headers", "query", "request.body"].forEach(path => {
         const data = _.get(ctx, path);
         if (data) {
            debug(data);
            _.set(ctx, path, sanitize(options, data));
         }
      });
      await next();
   };
};
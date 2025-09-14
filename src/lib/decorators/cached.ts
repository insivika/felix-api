import _debug from "debug";
import Keyv from "keyv";
import dayjs from "dayjs";
const debug = _debug("repliers:lib:decorators/cached");
class CacheFactory {
   static createCache(namespace: string) {
      return new Keyv({
         namespace
      });
   }
}
export interface Cached<T> {
   expires: number;
   result: T;
}
export interface KeyvCachedItem {
   data: any;
   created: number;
}
export default (namespace: string, ttl_ms: number) => {
   const cache = CacheFactory.createCache(namespace);
   return (_target: object, method: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor => {
      return {
         get() {
            const wrapperFn = async (...args: any[]): Promise<Cached<unknown>> => {
               const key = namespace + JSON.stringify(args);
               const cached = await cache.get<KeyvCachedItem>(key);
               if (cached) {
                  return {
                     result: cached.data,
                     expires: ttl_ms / 1000 - dayjs().diff(dayjs.unix(cached.created), "s")
                  };
               }
               const result = await propertyDescriptor.value.apply(this, args);
               debug("NS: %s, ttl: %s", namespace, ttl_ms);
               cache.set(key, {
                  data: result,
                  created: dayjs().unix()
               }, ttl_ms);
               return {
                  result,
                  expires: ttl_ms / 1000
               };
            };
            Object.defineProperty(this, method, {
               value: wrapperFn,
               configurable: true,
               writable: false
            });
            return wrapperFn;
         }
      };
   };
};
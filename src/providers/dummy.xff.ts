import { instanceCachingFactory } from "tsyringe";
export class DummyXFFProvider {
   constructor() {}
   isEnabled() {
      return false;
   }
   getHeader() {
      return '';
   }
}
export default {
   token: "XForwardedFor",
   useFactory: instanceCachingFactory(() => {
      return new DummyXFFProvider();
   })
};
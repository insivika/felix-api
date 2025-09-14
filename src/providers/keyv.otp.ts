import { instanceCachingFactory } from "tsyringe";
import Keyv from "keyv";
export default {
   token: "keyv.otp",
   useFactory: instanceCachingFactory(() => {
      return new Keyv({
         namespace: "otp"
      });
   })
};
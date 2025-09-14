import { instanceCachingFactory } from "tsyringe";
import Keyv from "keyv";
export default {
   token: "keyv.blocklist",
   useFactory: instanceCachingFactory(() => {
      return new Keyv({
         namespace: "blocklist"
      });
   })
};
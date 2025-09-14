import { XFFProvider } from "../../../lib/xffprovider.js";
import { instanceCachingFactory } from "tsyringe";
export default {
   token: "middleware.container.xff",
   useFactory: instanceCachingFactory(() => {
      return XFFProvider.getMiddleware();
   })
};
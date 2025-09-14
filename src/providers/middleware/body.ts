import { instanceCachingFactory } from "tsyringe";
import { koaBody } from "koa-body";
export default {
   token: "middleware.bodyparser",
   useFactory: instanceCachingFactory(() => {
      return koaBody({
         patchNode: true,
         includeUnparsed: true,
         formidable: {
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFiles: 1,
            filter: part => {
               const {
                  mimetype
               } = part;
               // keep only images
               return !!mimetype && mimetype.includes("image");
            }
         },
         multipart: true
      });
   })
};
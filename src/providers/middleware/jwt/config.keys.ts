import fs from "node:fs";
import { AppConfig } from "config.js";
import { instanceCachingFactory } from "tsyringe";
import path from "node:path";
const __dirname = import.meta.dirname;
export default {
   token: "middleware.jwt.config.keys",
   useFactory: instanceCachingFactory(container => {
      const config = container.resolve<AppConfig>("config");
      const keys = {
         private: Buffer.from(""),
         public: Buffer.from("")
      };
      if (config.auth.jwt.privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
         keys.private = Buffer.from(config.auth.jwt.privateKey);
      } else {
         const keyPath = path.resolve(__dirname, "..", "..", "..", "..", config.auth.jwt.privateKey);
         keys.private = fs.readFileSync(keyPath);
      }
      if (config.auth.jwt.publicKey.startsWith("-----BEGIN PUBLIC KEY-----")) {
         keys.public = Buffer.from(config.auth.jwt.publicKey);
      } else {
         const keyPath = path.resolve(__dirname, "..", "..", "..", "..", config.auth.jwt.publicKey);
         keys.public = fs.readFileSync(keyPath);
      }
      return keys;
   })
};
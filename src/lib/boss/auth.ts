import { createHmac } from "crypto";
import debugging from "debug";
const debug = debugging('repliers:lib:boss:auth');
export interface BossEmbedContext {
   example: boolean;
   debugState: string;
   context: string;
   account: {
      id: number;
      domain: string;
      owner: {
         name: string;
         email: string;
      };
   };
   person: {
      id: number;
      firstName: string;
      lastName: string;
      emails: Array<{
         value: string;
         type: string;
         status: string;
         isPrimary: number; // 1 or 0 ?
      }>;
      phones: Array<{
         value: string;
         normalized: string;
         type: string; // mobile ?
         status: string; // Not validated
         isPrimary: number; // 1 or 0 ?
      }>;
      stage: {
         id: number;
         name: string;
      };
   };
   user: {
      id: number;
      name: string;
      email: string;
   };
}
export const isFromFollowUpBoss = (context: string, signature: string, key: string): boolean => {
   const validSignature = createHmac("sha256", key).update(Buffer.from(context).toString("base64")).digest("hex");
   debug('valid signature %s', validSignature);
   return signature === validSignature;
};
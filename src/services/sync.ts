import { PeopleSyncRepository } from "../repository/people_sync.js";
import { SyncRepository } from "../repository/sync.js";
import { inject, injectable } from "tsyringe";
import RepliersClients, { RplClientsClient } from "./repliers/clients.js";
import BossService, { BossPeopleSingle } from "./boss.js";
import { JetStreamClient } from "@nats-io/jetstream";
import { ApiError } from "../lib/errors.js";
import type { AppConfig } from "../config.js";
import { RplOperator } from "../types/repliers.js";
import _ from "lodash";
import { secureFubAvmLink } from "../lib/utils.js";
export interface PeopleSyncPayload extends BossPeopleSingle {}
@injectable()
export default class SyncService {
   constructor(private readonly syncRepository: SyncRepository, private readonly peopleSyncRepository: PeopleSyncRepository, private readonly repliersClients: RepliersClients, private readonly boss: BossService, @inject("config")
   private config: AppConfig, @inject("nats")
   private readonly jsc: Promise<JetStreamClient>) {}
   async processUpsert(id: number, payload: PeopleSyncPayload) {
      try {
         const peopleSync = await this.peopleSyncRepository.getById(id);
         if (peopleSync === undefined) {
            throw new Error("Sync information not found");
         }
         const email = BossService.getPrimaryEmail(payload.emails);
         const phone = BossService.getPrimaryPhone(payload.phones);
         if (phone === undefined && email === undefined) {
            throw new Error("No email or phone found");
         }
         const possibleClient = await this.repliersClients.filter({
            externalId: payload.id.toString(),
            email: email?.value,
            phone: phone?.value,
            operator: RplOperator.OR
         });
         let client = possibleClient.clients[0];
         if (client === undefined) {
            client = await this.repliersClients.create({
               agentId: peopleSync.agent_id,
               email: email?.value,
               fname: payload.firstName,
               lname: payload.lastName,
               tags: payload.tags,
               status: true,
               phone: phone?.value,
               externalId: payload.id,
               data: {
                  fub: {
                     addresses: payload.addresses
                  }
               }
            });
         } else {
            await this.repliersClients.update({
               clientId: client.clientId,
               agentId: peopleSync.agent_id,
               email: email?.value,
               fname: payload.firstName,
               lname: payload.lastName,
               tags: payload.tags,
               status: true,
               phone: phone?.value,
               externalId: payload.id,
               data: {
                  ...client.data,
                  fub: {
                     addresses: payload.addresses
                  }
               }
            });
         }
         await this.makeSureAVMLink(payload, client);
         await this.peopleSyncRepository.update(id, {
            client_id: client.clientId,
            status: "SUCCESS"
         });
         await this.syncRepository.updateLastProcessedAt(peopleSync.sync_id);
      } catch (error) {
         let status = "UNKNOWN ERROR";
         if (error instanceof ApiError) {
            status = JSON.stringify({
               error: error.message,
               info: error.opts
            });
         } else if (error instanceof Error) {
            status = JSON.stringify({
               error: error.message
            });
         }
         await this.peopleSyncRepository.update(id, {
            status
         });
         throw error;
      }
   }
   async publishUpsert(id: number, payload: PeopleSyncPayload) {
      const jsc = await this.jsc;
      return jsc.publish(`${this.config.nats.worker.consumer_stream}.people.upsert`, JSON.stringify({
         id,
         payload
      }));
   }

   //TODO: should be fixed the same was as in webhook.ts
   private async makeSureAVMLink(person: BossPeopleSingle, client: RplClientsClient) {
      const fieldName = this.config.boss.custom_AVM_field;
      const existing = fieldName ? person[fieldName] : null;
      if (fieldName && !_.isString(existing) || _.isEmpty(existing)) {
         const link = secureFubAvmLink(this.config.eventsCollection.clientUrl, client.clientId.toString(), this.config.auth.agents_signature_salt);
         await this.boss.peopleUpdate(person.id.toString(), {
            [fieldName as string]: link
         });
      }
   }
}
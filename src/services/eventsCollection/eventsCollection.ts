import { injectable, inject } from "tsyringe";
import _debug from "debug";
import BossService, { BossEventsCreateRequest, BossNoteCreateRequest } from "../boss.js";
import type { AppConfig } from "config.js";
import { Context } from "koa";
import UserService from "../../services/user.js";
const debug = _debug("repliers:services:eventsCollection");
export type EventsCollectionPropertiesSelector = (ctx: Context) => Promise<BossEventsCreateRequest | null>;
export type NotesCollectionPropertiesSelector = (ctx: Context) => Promise<BossNoteCreateRequest | null>;
@injectable()
export default class EventsCollectionService {
   constructor(private boss: BossService, private userService: UserService, @inject("config")
   private config: AppConfig) {}
   eventsCreate(params: Partial<BossEventsCreateRequest>) {
      const {
         ignoreDefaultTags,
         ...rest
      } = params;
      debug("[reportEvent] params %O", params);
      this.boss.eventsCreate({
         ...this.config.eventsCollection.defaultEventFields,
         ...rest,
         person: {
            ...params.person,
            ...this.assignAgent(params.person),
            tags: ignoreDefaultTags ? params.person?.tags : this.assignTags(params.person)
         }
      }).then(r => {
         debug("[reportEvent] succeed %O", r);
      }).catch(e => {
         debug("[reportEvent] error %O", e);
      });
   }
   async noteCreate(params: BossNoteCreateRequest) {
      debug("[noteCreate] params %O", params);
      const {
         clientId,
         personId,
         ...rest
      } = params;
      this.getPersonId({
         clientId,
         personId
      }).then(personId => {
         debug("[noteCreate] personId %O", personId);
         this.boss.noteCreate({
            personId,
            ...rest
         }).then(r => {
            debug("[noteCreate] succeed %O", r);
         }).catch(e => {
            debug("[noteCreate] error %O", e);
         });
      });
   }
   private getPersonId(params: {
      personId?: string | number | undefined;
      clientId?: number | string | undefined;
   }): Promise<number> {
      return new Promise((resolve, reject) => {
         if (params.personId) {
            resolve(+params.personId);
         }
         if (params.clientId) {
            this.userService.info(+params.clientId).then(async client => {
               if (client.externalId) {
                  resolve(+client.externalId);
               } else {
                  const personSearchParams = client?.externalId ? {
                     id: client.externalId
                  } : {
                     email: client?.email
                  };
                  const bossPersons = await this.boss.getPeople(personSearchParams);
                  if (bossPersons?.people?.[0]?.id) {
                     resolve(bossPersons.people[0].id);
                  } else {
                     reject(new Error(`Person not found for clientId: ${params.clientId}`));
                  }
               }
            });
         } else {
            reject(new Error("personId or clientId is required"));
         }
      });
   }
   assignAgent(person: BossEventsCreateRequest["person"]) {
      const defaultPersonFields = this.config.eventsCollection.defaultPersonFields;
      return person?.assignedUserId ? {
         assignedUserId: person.assignedUserId
      } : {
         assignedTo: person?.assignedTo || defaultPersonFields.assignedTo
      };
   }
   assignTags(person: BossEventsCreateRequest["person"]) {
      const defaultPersonFields = this.config.eventsCollection.defaultPersonFields;
      return [...(defaultPersonFields.tags || []), ...(person?.tags || [])];
   }
}
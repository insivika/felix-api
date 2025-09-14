import { inject, injectable } from "tsyringe";
import RepliersService from "./repliers.js";
import { RplClientsUpdateDto } from "./repliers/clients.js";
import _ from "lodash";
import { type AppConfig } from "../config.js";
@injectable()
export default class UserService {
   constructor(private repliers: RepliersService, @inject('config')
   private config: AppConfig) {}
   update(params: RplClientsUpdateDto) {
      return this.repliers.clients.update({
         ...params
      });
   }
   async info(clientId: number) {
      const info = await this.repliers.clients.get(clientId);
      const communities = info.tags?.split(',') || [];
      return {
         ...info,
         communities
      };
   }
   async agent(clientId?: number) {
      const agent = clientId ? await this.userAgent(clientId) : await this.getDefaultAgent();
      return _.pick(agent, ['email', 'phone', 'fname', 'lname', 'avatar']);
   }
   private async getDefaultAgent() {
      const defaultAgentId = this.config.repliers.clients.defaultAgentId;
      return this.repliers.agents.get(defaultAgentId);
   }
   private async userAgent(clientId: number) {
      const info = await this.repliers.clients.get(clientId);
      return this.repliers.agents.get(info.agentId);
   }
}
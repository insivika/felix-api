import nock from "nock";
import config from "../../../src/config.js";
import _ from "lodash";
export const mockBossEvents = () => nock(config.boss.base_url).post(
// user create
"/events").reply(200, {});
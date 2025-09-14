import nock from "nock";
import config from "../../../src/config.js";
export const mockMessageCreate = () => nock(config.repliers.base_url).post("/messages") // send OTP code
.reply(200, {});
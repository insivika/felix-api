import nock from "nock";
import config from "../../../src/config.js";
export const mockSingle = (mlsNumber, stub) => {
   nock(config.repliers.base_url).get(`/listings/${mlsNumber}`).query(true).reply(200, stub);
};
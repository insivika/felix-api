import assert from "assert";
import supertest from "supertest";
import app from "../../src/app.js";
import _ from "lodash";
import { mockSingle } from "../mocks/repliers/listings.js";
import { RplListingsSingleResponse } from "../../src/services/repliers/listings.js";
import { AppConfig } from "../../src/config.js";
import { container } from "tsyringe";
const config = container.resolve<AppConfig>("config");
describe("Listings", function () {
   const setupApp = () => {
      return supertest(app.callback());
   };
   describe("Single listing", function () {
      const setupSingle = (mlsNumber: string, stub: Partial<RplListingsSingleResponse>) => {
         mockSingle(mlsNumber, stub);
         return setupApp();
      };
      it("should return single listing by mls number", async function () {
         const appInstance = setupSingle('new', {
            mlsNumber: 'new'
         });
         const listing = await appInstance.get("/api/listings/new?boardId=1");
         assert.equal(listing.status, 200);
         assert.equal(listing.body.mlsNumber, 'new');
      });
      it("should respond with `unavailable_listings_http_code` when listing's last status is Ter", async function () {
         const appInstance = setupSingle('terminated', {
            lastStatus: 'Ter'
         });
         const listing = await appInstance.get("/api/listings/terminated?boardId=1");
         assert.equal(listing.status, config.settings.hide_unavailable_listings_http_code);
      });
      it("should respond with `unavailable_listings_http_code` when listing's last status is Exp", async function () {
         const appInstance = setupSingle('expired', {
            lastStatus: 'Exp'
         });
         const listing = await appInstance.get("/api/listings/expired?boardId=1");
         assert.equal(listing.status, config.settings.hide_unavailable_listings_http_code);
      });
      it("should respond with `unavailable_listings_http_code` when listing's last status is Random", async function () {
         const appInstance = setupSingle('random', {
            lastStatus: 'Random'
         });
         const listing = await appInstance.get("/api/listings/random?boardId=1");
         assert.equal(listing.status, config.settings.hide_unavailable_listings_http_code);
      });
   });
});
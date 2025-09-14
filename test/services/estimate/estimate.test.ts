import assert from "node:assert";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent.js";
import app from "../../../src/app.js";
import { mockBossEvents } from "../../mocks/boss/boss.js";
import { estimateBounds, ownerAdjustedEstimates } from "../../../src/services/estimate.js";
import { mockAverageTax, mockDynamicPropertyDetails, mockEmptyAddressLookup, mockEmptyPropertyDetails, mockFailedAddressLookup, mockSameParityAddressLookup, mockTaxStats } from "../../mocks/repliers/estimatesDetails.js";
describe("Estimates tests", () => {
   describe("Owner Adjusted Estimates tests", () => {
      describe("estimateBounds", () => {
         it("Correct Bounds", () => {
            assert.deepEqual(estimateBounds(1000, 0.1), {
               estimateLow: 900,
               estimateHigh: 1100
            });
         });
      });
      describe("ownerAdjustedEstimate", () => {
         it("Correct Bounds with no History", () => {
            assert.deepEqual(ownerAdjustedEstimates(1000, 0.1, undefined), {
               estimate: 1000,
               estimateLow: 900,
               estimateHigh: 1100
            });
         });
         it("Correct Bounds with no History", () => {
            assert.deepEqual(ownerAdjustedEstimates(1000, 0.1, {
               improvements: {
                  maintenanceSpent: 100,
                  improvementSpent: 100,
                  landscapingSpent: 100
               }
            }), {
               estimate: 1210,
               estimateHigh: 1331,
               estimateLow: 1089
            });
         });
         it("Correct Bounds with partial History", () => {
            assert.deepEqual(ownerAdjustedEstimates(1000, 0.1, {
               improvements: {
                  maintenanceSpent: 100
               }
            }), {
               estimate: 1060,
               estimateHigh: 1166,
               estimateLow: 954
            });
         });
      });
   });
   describe("propertyDetails", () => {
      let appInstance: TestAgent;
      let GlobalDate = Date;
      const mockDate = (mock: Date) => {
         global.Date = class extends Date {
            constructor(...args: any[]) {
               super();
               if (args.length === 0) {
                  return mock;
               }
               return new GlobalDate(...(args as [number, number, number]));
            }
         } as DateConstructor;
      };
      before(done => {
         appInstance = supertest(app.callback());
         done();
      });
      beforeEach(done => {
         mockBossEvents();
         global.Date = GlobalDate;
         done();
      });
      describe("hood lookup", () => {
         it("Should return only city and tax details when no history as well as closest listings", async function () {
            mockDate(new Date(2024, 6, 1));
            mockEmptyPropertyDetails();
            mockEmptyAddressLookup();
            mockAverageTax();
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=Toronto&streetName=Yonge&streetNumber=150&unitNumber=1");
            assert.deepEqual(propertyDetailsResponse.body, {
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: 1000,
                  assessmentYear: 2024
               }
            });
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should return closest listing's neighborhood and taxes when no history", async function () {
            mockDate(new Date(2025, 5, 30));
            mockEmptyPropertyDetails();
            mockSameParityAddressLookup();
            mockAverageTax();
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=Toronto&streetName=Yonge&streetNumber=150&unitNumber=1");
            assert.deepEqual(propertyDetailsResponse.body, {
               address: {
                  city: "Toronto",
                  neighborhood: "154"
               },
               taxes: {
                  annualAmount: 1000,
                  assessmentYear: 2024
               }
            });
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should return just city when address lookup throws", async function () {
            mockDate(new Date(2025, 0, 1));
            mockEmptyPropertyDetails();
            mockFailedAddressLookup();
            mockAverageTax();
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=Toronto&streetName=Yonge&streetNumber=150&unitNumber=1");
            assert.deepEqual(propertyDetailsResponse.body, {
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: 1000,
                  assessmentYear: 2024
               }
            });
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should still return address when average tax response failed", async function () {
            mockEmptyPropertyDetails();
            mockSameParityAddressLookup();
            mockAverageTax(500, {
               message: "Internal Server Error"
            });
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=Toronto&streetName=Yonge&streetNumber=150&unitNumber=1");
            assert.deepEqual(propertyDetailsResponse.body, {
               address: {
                  city: "Toronto",
                  neighborhood: "154"
               }
            });
            assert.equal(propertyDetailsResponse.status, 200);
         });
      });
      describe("tax adjustment", () => {
         it("Should adjust property tax if old data", async () => {
            mockDate(new Date(2025, 5, 30));
            mockDynamicPropertyDetails(queryObject => queryObject.city === "TaxAdjust", [{
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: 100
               },
               updatedOn: "2020-01-17T18:38:41.000-00:00"
            }]);
            mockTaxStats({
               "2020": {
                  avg: 50,
                  count: 52
               },
               "2021": {
                  avg: 0,
                  count: 0
               },
               "2022": {
                  avg: 4007,
                  count: 4272
               },
               "2023": {
                  avg: 4120,
                  count: 15046
               },
               "2024": {
                  avg: 200,
                  // this value should be used givin 4x multiplier
                  count: 19681
               },
               "2025": {
                  avg: 4300,
                  count: 1633
               }
            });
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=TaxAdjust&streetName=whatever&streetNumber=whocares");
            assert.equal(propertyDetailsResponse.body.taxes.annualAmount, 400);
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should not adjust property tax if recent data", async () => {
            mockDynamicPropertyDetails(query => query.city === "RecentTax", [{
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: 5000
               },
               updatedOn: "2027-01-17T18:38:41.000-00:00" // date is mocked to the first half of 2028 so 2027 would be current tax year
            }]);
            mockDate(new Date(2028, 0, 23));
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=RecentTax&streetName=whatever&streetNumber=whocares");
            assert.equal(propertyDetailsResponse.body.taxes.annualAmount, 5000);
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should not adjust property tax if stats missing", async () => {
            mockDynamicPropertyDetails(query => query.city === "NoStats", [{
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: "as is"
               },
               updatedOn: "2020-01-17T18:38:41.000-00:00"
            }]);
            mockTaxStats({
               "2024": {
                  med: 200,
                  count: 19681
               },
               "2025": {
                  med: 4300,
                  count: 1633
               }
            });
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=NoStats&streetName=whatever&streetNumber=whocares");
            assert.equal(propertyDetailsResponse.body.taxes.annualAmount, "as is");
            assert.equal(propertyDetailsResponse.status, 200);
         });
         it("Should return current year med tax if no tax in history", async () => {
            mockDate(new Date(2025, 5, 23));
            mockDynamicPropertyDetails(query => query.city === "NoTax", [{
               address: {
                  city: "Toronto"
               },
               taxes: {
                  annualAmount: 0
               },
               updatedOn: "2020-01-17T18:38:41.000-00:00"
            }]);
            mockTaxStats({
               "2024": {
                  avg: 9999,
                  count: 19681
               },
               "2025": {
                  avg: 4300,
                  count: 1633
               }
            });
            const propertyDetailsResponse = await appInstance.get("/api/estimate/property_details?city=NoTax&streetName=whatever&streetNumber=whocares");
            assert.equal(propertyDetailsResponse.body.taxes.annualAmount, 9999);
            assert.equal(propertyDetailsResponse.status, 200);
         });
      });
   });
});
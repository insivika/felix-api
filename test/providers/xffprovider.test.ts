import assert from "node:assert";
import { sanitizeIpAddr } from "../../src/lib/xffprovider.js";
describe("XFF Provider tests", () => {
   describe("utils tests", () => {
      describe("sanitizeIpAddr", () => {
         it("Correct IP Address", () => {
            assert.deepEqual(sanitizeIpAddr("192.168.1.1"), "192.168.1.1");
         });
         it("Spaced IP Address", () => {
            assert.deepEqual(sanitizeIpAddr("   192.168.1.1   "), "192.168.1.1");
         });
         it("ipv6 prefixed IP Address", () => {
            assert.deepEqual(sanitizeIpAddr(" ::ffff:192.168.1.1   "), "192.168.1.1");
         });
      });
   });
});
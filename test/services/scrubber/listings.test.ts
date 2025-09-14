import assert from "assert";
import { ListingsScrubber } from "../../../src/services/scrubber/listings.js";
import { singleListing, singleListingUStatus, singleListingDispayPublicN, singleListingDispayAddressOnInternetN, singleListingWComparables, singleListingsAStatusNoDuplicates } from "../../mocks/scrubber/listings.js";
import _ from "lodash";
import { before } from "mocha";
import { container } from "tsyringe";
import { AppConfig } from "../../../src/config.js";
const FILL_STR = "!scrubbed!";
describe("Scrubbing tests", function () {
   describe("Listings scrubber for authorised users", function () {
      it("Should Not scrub anything for authenticated user ", function () {
         const listingsScrubber = new ListingsScrubber([{
            app_state: {
               user: {
                  sub: 123
               }
            }
         }]);
         const before = JSON.parse(JSON.stringify(singleListing));
         const after = listingsScrubber.scrub(before);
         assert.deepEqual(after, before);
      });
   });
   describe("Listings scrubber for guests", function () {
      it("Should scrub if status = U", function () {
         const listingsScrubber = new ListingsScrubber([{
            app_state: {}
         }]);
         const before = JSON.parse(JSON.stringify(singleListingUStatus));
         const after = listingsScrubber.scrub(before);
         assert.notDeepEqual(before, after);
         assert.equal(after.resource, FILL_STR);
         assert.equal(after.listPrice, FILL_STR);
         assert.equal(after.lastStatus, FILL_STR);
         assert.equal(after.address?.zip, FILL_STR);
      });
      it("Should scrub if permissions.displayPublic = N", function () {
         const listingsScrubber = new ListingsScrubber([{
            app_state: {}
         }]);
         const before = JSON.parse(JSON.stringify(singleListingDispayPublicN));
         const after = listingsScrubber.scrub(before);
         assert.notDeepEqual(before, after);
         assert.equal(after.resource, FILL_STR);
         assert.equal(after.listPrice, FILL_STR);
         assert.equal(after.lastStatus, FILL_STR);
         assert.equal(after.address?.zip, FILL_STR);
      });
      it("Should scrub address if permissions.displayAddressOnInternet = N", function () {
         const listingsScrubber = new ListingsScrubber([{
            app_state: {}
         }]);
         const before = JSON.parse(JSON.stringify(singleListingDispayAddressOnInternetN));
         const after = listingsScrubber.scrub(before);
         assert.notDeepEqual(before, after);
         assert.equal(after.address?.zip, FILL_STR);
      });
      it("Should scrub comparables", function () {
         const listingsScrubber = new ListingsScrubber([{
            app_state: {}
         }]);
         const before = JSON.parse(JSON.stringify(singleListingWComparables));
         const after = listingsScrubber.scrub(before);
         assert.notDeepEqual(before, after);
         assert.equal(after?.comparables?.at(0)?.listPrice, FILL_STR);
         assert.equal(after?.comparables?.at(0)?.lastStatus, FILL_STR);
         assert.equal(after?.comparables?.at(0)?.address?.zip, FILL_STR);
      });
      describe('With scrubbing_duplicates = true', function () {
         before(function () {
            const config = container.resolve<AppConfig>('config');
            config.settings.scrubbing_duplicates_enabled = true;
         });
         it("Should scrub if status = A and no duplicates", function () {
            const listingsScrubber = new ListingsScrubber([{
               app_state: {}
            }]);
            const before = JSON.parse(JSON.stringify(singleListingsAStatusNoDuplicates));
            const after = listingsScrubber.scrub(before);
            assert.notDeepEqual(before, after);
            assert.equal(after.resource, FILL_STR);
            assert.equal(after.listPrice, FILL_STR);
            assert.equal(after.lastStatus, FILL_STR);
            assert.equal(after.address?.zip, FILL_STR);

            // and should update displayPublic to N
            assert.equal(after.permissions?.displayPublic, "N");
         });
      });
      describe('With scrubbing_duplicates = false', function () {
         before(function () {
            const config = container.resolve<AppConfig>('config');
            config.settings.scrubbing_duplicates_enabled = false;
         });
         it("Should scrub if status = A and no duplicates", function () {
            const listingsScrubber = new ListingsScrubber([{
               app_state: {}
            }]);
            const before = JSON.parse(JSON.stringify(singleListingsAStatusNoDuplicates));
            const after = listingsScrubber.scrub(before);
            assert.notDeepEqual(before, after);
            assert.equal(after.resource, 'Property:6585');
            assert.equal(after.listPrice, '874900.00');
            assert.equal(after.lastStatus, 'New');
            assert.equal(after.address?.zip, 'K1G 0G4');

            // and should update displayPublic to N
            assert.equal(after.permissions?.displayPublic, "Y");
         });
      });
   });
});
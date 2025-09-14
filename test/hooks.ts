import "reflect-metadata";
import { container } from "tsyringe";
import { Knex } from "knex";
import "../test/providers/index.js";
export const mochaHooks = {
   beforeEach(done: () => void) {
      // do something before every test
      done();
   },
   afterAll(done: () => void) {
      container.resolve<Knex>("db").destroy().then(done);
   }
};
import Joi from 'joi';
import * as PolsinelloOverrides from './polsinello.js';
export * from './polsinello.js';
export const overrides = (version?: string) => {
   switch (version) {
      case 'polsinello':
         return PolsinelloOverrides;
      default:
         return {} as Record<string, Joi.Schema>;
   }
};
import joi from "joi";
import { RplClass, RplLastStatus, RplOperator, RplSortBy, RplStatus, RplType, RplYesNo } from "../types/repliers.js";

/**
 * @openapi
 * components:
 *    schemas:
 *       stringArray:
 *          type: array
 *          items:
 *             type: string
 */
export const stringArraySchema = joi.array().items(joi.string()).single();

/**
 * @openapi
 * components:
 *    schemas:
 *       ContactEmail:
 *          type: string
 *          maxLength: 70
 *          format: email
 */
export const emailSchema = joi.string().email().max(70);

/**
 * @openapi
 * components:
 *    schemas:
 *       ContactPhone:
 *          type: string
 *          pattern: '^(1)([0-9]{10})$'
 */
export const phoneSchema = joi.string().pattern(new RegExp("^(1)([0-9]{10})$"));

/**
 * @openapi
 * components:
 *    schemas:
 *       mlsNumber:
 *          type: string
 *          pattern: '^([a-zA-Z0-9]{1,32})$'
 */
export const mlsNumberSchema = joi.string().pattern(new RegExp("^([a-zA-Z0-9]{1,32})$"));

/**
 * @openapi
 * components:
 *    schemas:
 *       ContactName:
 *          type: string
 *          minLength: 1
 *          maxLength: 70
 */
export const contactNameSchema = joi.string().min(1).max(70);

/**
 * @openapi
 * components:
 *    schemas:
 *       ContactMessage:
 *          type: string
 *          minLength: 10
 *          maxLength: 1024
 */
export const contactMessageSchema = joi.string().min(10).max(1024);

/**
 * @openapi
 * components:
 *    schemas:
 *       password:
 *          type: string
 *          minLength: 8
 *          format: password
 */
export const passwordSchema = joi.string().max(255).min(8).required();

/**
 * @openapi
 * components:
 *     schemas:
 *        RplDate:
 *           type: string
 *           format: date
 */
export const dateSchema = joi.string().pattern(/^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/);

/**
 * @openapi
 * components:
 *    schemas:
 *         User:
 *            type: object
 *            properties:
 *               email:
 *                  type: string
 *               sub:
 *                  type: number
 *               iat:
 *                  type: number
 *               exp:
 *                  type: number
 *               iss:
 *                  type: string
 *               jti:
 *                  type: string
 *                  format: uuid
 */
export const userSchema = joi.object().keys({
   email: joi.string(),
   sub: joi.string(),
   iat: joi.number(),
   exp: joi.number(),
   iss: joi.string(),
   jti: joi.string(),
   role: joi.number(),
   external: joi.object().unknown()
});
export const appStateSchema = joi.object().keys({
   user: userSchema
});

/**
 * @openapi
 * components:
 *  schemas:
 *     RplYesNo:
 *        type: string
 *        enum: [Y, N]
 */
export const rplYesNoSchema = joi.string().valid(...Object.values(RplYesNo));

/**
 * @openapi
 * components:
 *  schemas:
 *     RplLastStatus:
 *        type: array
 *        items:
 *           type: string
 *           enum: [Sus, Exp, Sld, Ter, Dft, Lsd, Sc, Sce, Lc, Pc, Ext, New]
 */
export const rplLastStatus = joi.array().items(joi.string().valid(...Object.keys(RplLastStatus))).single();

/**
 * @openapi
 * components:
 *  schemas:
 *     RplOperator:
 *        type: string
 *        enum: [AND, OR]
 */
export const rplOperatorSchema = joi.string().valid(...Object.keys(RplOperator));

/**
 * @openapi
 * components:
 *  schemas:
 *     RplSortBy:
 *        type: string
 *        enum: [createdOnDesc, updatedOnDesc, createdOnAsc, distanceAsc, distanceDesc, updatedOnAsc, soldDateAsc, soldDateDesc, soldPriceAsc, soldPriceDesc, sqftAsc, sqftDesc, listPriceAsc, listPriceDesc, bedsAsc, bedsDesc, bathsDesc, bathsAsc, yearBuiltDesc, yearBuiltAsc, random]
 */
export const rplSortBySchema = joi.string().valid(...Object.values(RplSortBy));

/**
 * @openapi
 * components:
 *  schemas:
 *     RplStatistics:
 *        type: array
 *        items:
 *           type: string
 *           enum: [avg-daysOnMarket, sum-daysOnMarket, min-daysOnMarket, max-daysOnMarket, avg-listPrice, sum-listPrice, min-listPrice, max-listPrice, avg-soldPrice, sum-soldPrice, min-soldPrice, max-soldPrice, cnt-new, cnt-closed, med-listPrice, med-soldPrice, med-daysOnMarket, sd-listPrice, sd-soldPrice, sd-daysOnMarket,avg-priceSqft, grp-mth, grp-yr]
 */
export const rplStatisticsSchema = joi.string();
// disabling custom validation because Repliers has its own validation and very informative error messages
// this validation makes developer experience even worse without providing any business value

// .custom((value: string, helpers) => {
//    const values = value.split(",").map((v) => v.trim()) as RplStatistics[];
//    const invalidValues = values.filter(
//       (v) => !Object.values(RplStatistics).includes(v)
//    );
//    if (0 < invalidValues.length) {
//       return helpers.error("statistics", {
//          values: Object.values(RplStatistics),
//       });
//    }
//    return value;
// }, "RplStatistics Validation");

/**
 * @openapi
 * components:
 *  schemas:
 *     RplStatus:
 *        type: array
 *        items:
 *           type: string
 *           enum: [A, U]
 */
export const rplStatusSchema = joi.array().items(joi.string().valid(...Object.values(RplStatus))).single();

/**
 * @openapi
 * components:
 *  schemas:
 *     RplType:
 *        type: array
 *        items:
 *           $ref: '#/components/schemas/RplTypeEnum'
 */
export const rplTypeSchema = joi.array().items(joi.string().valid(...Object.values(RplType))).single();

/**
 * @openapi
 * components:
 *  schemas:
 *     RplTypeEnum:
 *        type: string
 *        enum: [sale, lease]
 */
export const rplTypeSingleSchema = joi;
joi.string().valid(...Object.values(RplType));

/**
 * @openapi
 * components:
 *  schemas:
 *     RplClass:
 *        type: array
 *        items:
 *           type: string
 *           enum: [condo, residential, commercial]
 */
export const rplClassSchema = joi.array().items(joi.string().valid(...Object.values(RplClass))).single();
export const csvFieldValidator = (validValues: string[]) => {
   return joi.string().custom((value, helpers) => {
      if (!value) return value;
      const fields = value.split(",").map((field: string) => field.trim());
      const allValid = fields.every((field: string) => validValues.includes(field));
      if (!allValid) {
         return helpers.error("string.invalidFields", {
            value,
            validValues: validValues.join(", ")
         });
      }
      return value;
   }, "validate comma-separated fields").messages({
      'string.invalidFields': '{{#label}} contains invalid value(s). Valid values are: {{#validValues}}'
   });
};
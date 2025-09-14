const FillString = "!scrubbed!";
const FillNumber = 0;
const FillDate = "1900-06-21T01:39:00.000Z"; //Summer Solstice of 1900 - MAGIC string
const isoDateRegExp = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/);
export default class BaseScrubber {
   dropFields<T>(value: T, fields: Array<keyof T>) {
      fields.forEach(field => delete value[field]);
      return value;
   }
   valueScrubber(value: unknown) {
      switch (true) {
         case typeof value === "string":
            {
               if (isoDateRegExp.test(value)) {
                  return FillDate;
               }
               return FillString;
            }
         case typeof value === "number":
            return FillNumber;
         default:
            return value;
      }
   }
   objectScrubber<T>(obj: T, safeFields: string[]): T {
      const scrubbedObj = {
         ...obj
      };
      for (const key in scrubbedObj) {
         // For each unsafe fields we check
         if (!safeFields.includes(key)) {
            // if it's nested object we just scrub every field of it
            if (typeof scrubbedObj[key] === "object" && scrubbedObj[key] !== null && !Array.isArray(scrubbedObj[key])) {
               scrubbedObj[key] = this.objectScrubber(scrubbedObj[key], safeFields);
            } else {
               // if it's not object, than it's regular value so we scrub it in the same way
               (scrubbedObj[key] as unknown) = this.valueScrubber(scrubbedObj[key]);
            }
         }
      }
      return scrubbedObj;
   }
}
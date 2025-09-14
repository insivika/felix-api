/**
 * @openapi
 * components:
 *    responses:
*       BadRequest:
 *          description: Return error message on validation fails or some expected conditions
 *          content:
 *             applicaiton/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      message:
 *                         type: string
 *                         description: Error message
 *       Forbidden:
 *          description: Return error message if trying to make modifications with non-owned objects or w/o sufficient permissions
 *          content:
 *             applicaiton/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      message:
 *                         type: string
 *                         description: Error message
 *       Unauthorized:
 *          description: |
 *             Occurs in various situations during authorization and regular api calls
 *
 *             * Login / password combination is invalid during "login" operation
 *             * Signature is invalid during "signature check" operation on biometrics login
 *             * JWT Token in authorization header is invalid or expired
 *          content:
 *             application/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      message:
 *                         type: string
 *       NotFound:
 *          description: Resource Not Found
 *          content:
 *             applicaiton/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      message:
 *                         type: string
 *                         description: Error message
 *       PreconditionFailed:
 *          description: |
 *             Right now occurs only when Repliers email token has expired
 *          content:
 *             application/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      message:
 *                         type: string

 *
 */
export class ApiError extends Error {
   status: number | undefined;
   opts: Record<string, string | string[]> | undefined;
   constructor(message: string, status?: number, opts?: Record<string, string | string[]>) {
      super(message);
      this.status = status;
      this.opts = opts;
   }
}
export class DBError extends Error {}
export class ApiWarning extends Error {}
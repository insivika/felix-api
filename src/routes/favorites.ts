import Router from "@koa/router";
import { container } from "tsyringe";
import { Middleware } from "koa-jwt";
import { ApiError } from "../lib/errors.js";
import FavoritesService from "../services/favorites.js";
import { favoritesCreateSchema, favoritesDeleteSchema } from "../validate/favorites.js";
import type { EventsCollectionMiddleware } from "../providers/middleware/eventsCollection.js";
import SelectSavePropertyParams from "../services/eventsCollection/selectors/selectSavePropertyParams.js";
const router = new Router({
   prefix: "/favorites"
});
const authMiddleware = container.resolve<Middleware>("middleware.jwt");

/**
 * @openapi
 * /api/favorites:
 *    post:
 *       tags:
 *          - Favorites
 *       summary: Use this endpoint to add a new favorite for a client.
 *       security:
 *          - bearerAuth: []
 *       requestBody:
 *          description: Favorite mlsNumber and boardId
 *          content:
 *             application/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                      mlsNumber:
 *                         type: string
 *                      boardId:
 *                         type: number
 *                         description: Required if your account has access to multiple MLSes.
 *                   required: [mlsNumber]
 *       responses:
 *          400:
 *             $ref: '#/components/responses/BadRequest'
 *          401:
 *             $ref: '#/components/responses/Unauthorized'
 */
router.post("/", authMiddleware, async (ctx, next) => {
   ctx.state['enable.xff'] = true;
   const {
      error,
      value
   } = favoritesCreateSchema.validate({
      ...ctx.request.body,
      clientId: ctx.state["user"].sub
   });
   if (error) {
      ctx.throw(new ApiError(error.message, 400));
      return;
   }
   const favoritesService = ctx.state.container.resolve(FavoritesService);
   ctx.body = await favoritesService.add(value);
   next();
}, (ctx, next) => {
   const eventsCollectionMiddleware = ctx.state.container.resolve<EventsCollectionMiddleware>("middleware.eventsCollection");
   const selectSavePropertyParams = ctx.state.container.resolve(SelectSavePropertyParams);
   const savePropertyEventsCollector = eventsCollectionMiddleware({
      selector: selectSavePropertyParams.select
   });
   return savePropertyEventsCollector(ctx, next);
});

/**
 * @openapi
 * /api/favorites:
 *    get:
 *       tags:
 *          - Favorites
 *       summary: Use this endpoint to retrieve a list of properties that a client has favorited.
 *       security:
 *          - bearerAuth: []
 *       responses:
 *          400:
 *             $ref: '#/components/responses/BadRequest'
 *          401:
 *             $ref: '#/components/responses/Unauthorized'
 */
router.get("/", authMiddleware, async ctx => {
   ctx.state['enable.xff'] = true;
   const favoritesService = ctx.state.container.resolve(FavoritesService);
   ctx.body = await favoritesService.get(ctx.state["user"].sub);
});

/**
 * @openapi
 * /api/favorites/{favoriteId}:
 *    delete:
 *       tags:
 *          - Favorites
 *       summary: Use this endpoint to delete a favorite.
 *       security:
 *          - bearerAuth: []
 *       parameters:
 *          - in: path
 *            name: favoriteId
 *            schema:
 *               type: number
 *       responses:
 *          400:
 *             $ref: '#/components/responses/BadRequest'
 *          401:
 *             $ref: '#/components/responses/Unauthorized'
 */
router.delete("/:favoriteId", authMiddleware, async ctx => {
   ctx.state['enable.xff'] = true;
   const {
      error,
      value
   } = favoritesDeleteSchema.validate({
      clientId: ctx.state["user"].sub,
      favoriteId: ctx.params["favoriteId"]
   });
   if (error) {
      ctx.throw(new ApiError(error.message, 400));
      return;
   }
   const favoritesService = ctx.state.container.resolve(FavoritesService);
   ctx.body = await favoritesService.delete(value.clientId, value.favoriteId);
});
export default router;
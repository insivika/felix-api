import Router from "@koa/router";
import { container } from "tsyringe";
import StrapiService from "../services/strapi.js";
import { ApiError } from "../lib/errors.js";

const router = new Router({
   prefix: "/content",
});

/**
 * @openapi
 * /api/content/articles:
 *    get:
 *       tags:
 *          - Content
 *       summary: Get articles from Strapi
 *       parameters:
 *          - in: query
 *            name: pageNum
 *            schema:
 *               type: integer
 *               minimum: 1
 *            required: false
 *            description: Page number for pagination
 *          - in: query
 *            name: categoryId
 *            schema:
 *               type: string
 *            required: false
 *            description: Filter by category ID
 *       responses:
 *          200:
 *             description: List of articles
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *                      properties:
 *                         articles:
 *                            type: array
 *                            items:
 *                               type: object
 *                         count:
 *                            type: integer
 *          400:
 *             $ref: '#/components/responses/BadRequest'
 */
router.get("/articles", async (ctx) => {
   const strapiService = container.resolve(StrapiService);

   const pageNum = ctx.query["page"];
   const pageSize = ctx.query["pageSize"];
   const categoryId = ctx.query["categoryId"];
   const isFeatured = ctx.query["isFeatured"];

   const result = await strapiService.getArticles({
      pageNum: pageNum ? parseInt(pageNum as string, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 10,
      ...(categoryId && { categoryId: categoryId as string }),
      ...(isFeatured && { isFeatured: isFeatured === "true" ? true : false }),
   });

   ctx.body = result;
});

/**
 * @openapi
 * /api/content/articles/{slug}:
 *    get:
 *       tags:
 *          - Content
 *       summary: Get a single article by slug
 *       parameters:
 *          - in: path
 *            name: slug
 *            schema:
 *               type: string
 *            required: true
 *            description: Article slug
 *       responses:
 *          200:
 *             description: Article details
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *          404:
 *             description: Article not found
 */
router.get("/articles/:slug", async (ctx) => {
   const strapiService = container.resolve(StrapiService);
   const { slug } = ctx.params;

   const article = await strapiService.getArticleBySlug(slug as string);

   if (!article) {
      throw new ApiError("Article not found", 404);
   }

   ctx.body = article;
});

/**
 * @openapi
 * /api/content/categories/{slug}:
 *    get:
 *       tags:
 *          - Content
 *       summary: Get an article category by slug
 *       parameters:
 *          - in: path
 *            name: slug
 *            schema:
 *               type: string
 *            required: true
 *            description: Category slug
 *       responses:
 *          200:
 *             description: Category details
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *          404:
 *             description: Category not found
 */
router.get("/categories/:slug", async (ctx) => {
   const strapiService = container.resolve(StrapiService);
   const { slug } = ctx.params;

   const category = await strapiService.getArticleCategory(slug);

   if (!category) {
      throw new ApiError("Category not found", 404);
   }

   ctx.body = category;
});

export default router;

import Router from "@koa/router";
import bossWebhooksRouter from "./boss.js";
const router = new Router({
   prefix: "/webhooks"
});
router.use(bossWebhooksRouter.routes(), bossWebhooksRouter.allowedMethods());
export default router;
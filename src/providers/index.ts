import { registry } from "tsyringe";
import loggerMiddleware from "./middleware/logger.js";
import loggerGlobal from "./logger.global.js";
import logger from "./logger.js";
import config from "./config.js";
import swaggerMiddleware from "./middleware/swagger.js";
import helmetMiddleware from "./middleware/helmet.js";
import bodyparserMiddleware from "./middleware/body.js";
import roleMiddlware from "./middleware/role.js";
import corsMiddleware from "./middleware/cors.js";
import jwtMiddlewareConfig from "./middleware/jwt/config.js";
import jwtMiddlewareConfigKeys from "./middleware/jwt/config.keys.js";
import jwtMiddleware from "./middleware/jwt/strapi.js";
import jwtMiddlewarePassthrough from "./middleware/jwt/passthrough.js";
import xssMiddleware from "./middleware/xss.js";
import compressMiddleware from "./middleware/compress.js";
import sslifyMiddleware from "./middleware/sslify.js";
import pinoMiddleware from "./middleware/pino.js";
import eventsCollectionMiddleware from "./middleware/eventsCollection.js";
import oauthGoogle from "./oauth/google.js";
import keyvBlocklist from "./keyv.blocklist.js";
import keyvSignupcodes from "./keyv.otp.js";
import dataCommunities from "./data/communities.js";
import db from "./db.js";
import nats from "./nats.js";
import containerMiddleware from "./middleware/container.js";
import containerXffMiddleware from "./middleware/container/xff.js";
import dummyXFFProvider from "./dummy.xff.js";
import bossWebhookAuth from "./middleware/boss.webhook.auth.js";
import asyncLocalStore from "./asyncLocalStore.js";
@registry([
   asyncLocalStore,
   config,
   logger,
   loggerGlobal,
   loggerMiddleware,
   keyvBlocklist,
   swaggerMiddleware,
   helmetMiddleware,
   bodyparserMiddleware,
   corsMiddleware,
   roleMiddlware,
   jwtMiddlewareConfig,
   jwtMiddlewareConfigKeys,
   jwtMiddlewarePassthrough,
   jwtMiddleware,
   xssMiddleware,
   compressMiddleware,
   sslifyMiddleware,
   pinoMiddleware,
   oauthGoogle,
   keyvSignupcodes,
   dataCommunities,
   eventsCollectionMiddleware,
   db,
   nats,
   containerMiddleware,
   containerXffMiddleware,
   dummyXFFProvider,
   bossWebhookAuth,
])
export default class ContainerRegistry {}

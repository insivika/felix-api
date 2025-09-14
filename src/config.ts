import assert from "node:assert";
import dotenv from "dotenv";
import { OAuthProviders, SocialProvider, UserRole } from "./constants.js";
import { BossEventPerson, BossEventsCreateRequest, CustomBossField } from "./services/boss.js";
import type { Knex } from "knex";
import path from "node:path";
import { ConnectionOptions } from "@nats-io/transport-node";
import { StringValue } from "ms";
const __dirname = import.meta.dirname;
import Settings from "./lib/settings.js";
const envFilePath = path.join(__dirname, "..", process.env["DOT_ENV_CONFIG"] || ".env");
dotenv.config({
   path: envFilePath
});
export type JwtSettings = {
   privateKey: string;
   publicKey: string;
   issuer: string;
   expire: StringValue;
};
const otpMessageTypes = ["link", "code", "link_and_code"] as const;
export type OtpMessageType = (typeof otpMessageTypes)[number];
const parseOtpMessageType = (type: string | undefined): OtpMessageType => {
   if (type === undefined || !otpMessageTypes.includes(type as OtpMessageType)) {
      return "link_and_code";
   }
   return type as OtpMessageType;
};
export interface AppConfig {
   env: string;
   db: Knex.Config;
   nats: {
      enabled: boolean;
      options: ConnectionOptions;
      worker: {
         consumer_stream: string;
         consumer_name: string;
      };
      creds: string;
   };
   logtail: {
      token: string;
   };
   auth: {
      agents_signature_salt: string;
      jwt: JwtSettings;
      oauth: { [key in OAuthProviders]: {
         client_id: string;
         client_secret: string;
         redirect_uri: string;
         scopes: string;
      } };
      social: { [key in SocialProvider]: {
         client_id: string;
         client_secret: string;
         redirect_uri: string;
         scopes: string;
      } };
      otp: {
         resend_ttl_ms: number;
         ttl_ms: number;
         uri: string;
         message: string;
         message_type: OtpMessageType;
         debug_expose_code: boolean;
      };
      emailtoken: {
         enabled: boolean;
         expire: StringValue;
         auto_otp: boolean;
      };
      roleOverrides?: { [role in UserRole]?: {
         jwt?: Partial<JwtSettings>;
      } };
   };
   app: {
      settings: string | undefined; // Preset name, e.g. "defaults", "gta_portal"
      env: string;
      loglevel: string;
      disable_persistence: boolean;
      port: string | number;
      stats_top_n: number;
      useSwagger: boolean;
      cors: {
         validDomains: [string, ...string[]];
      };
   };
   cache: {
      neighborhoodsranking: {
         ttl_ms: number;
      };
      statswidget: {
         ttl_ms: number;
      };
      autosuggest_locations: {
         ttl_ms: number;
      };
      listingscount: {
         ttl_ms: number;
      };
   };
   repliers: {
      api_key: string;
      api_key_extra: string;
      historical_data_key: string;
      base_url: string;
      timeout_ms: number;
      proxy_xff: boolean;
      clients: {
         defaultAgentId: number;
         unauthenticatedClientId: number;
         defaultAgentEmail?: string | undefined;
      };
      autosuggest: {
         max_results: number;
         max_results_default: number;
         lat: string;
         long: string;
         radius: number;
         provider: "mapbox" | "googlemaps";
      };
      limit: number;
      interval: number;
      estimatesNotificationSettings?: {
         sendEmailNow?: boolean | undefined;
         sendEmailMonthly?: boolean | undefined;
      };
   };
   boss: {
      enabled: boolean;
      base_url: string;
      timeout_ms: number;
      username: string;
      password: string;
      system: string;
      system_key: string;
      webhook: {
         enabled: boolean;
         base_url: string;
         use_ngrok: boolean;
         client_tags: string;
      };
      custom_AVM_field?: CustomBossField | undefined;
   };
   ngrok: {
      authtoken: string;
   };
   eventsCollection: {
      defaultEventFields: Partial<BossEventsCreateRequest>;
      defaultPersonFields: Partial<BossEventPerson>;
      defaultBoardId: string;
      urlHost?: string | undefined;
      propertyUrl: string;
      clientUrl: string;
      estimateUrl: string;
      savedSearchUrl?: string;
      customFieldsStrategy?: string | undefined;
      reportClientViewEstimate?: boolean | undefined;
   };
   mapbox: {
      access_token: string;
      base_url: string;
      timeout_ms: number;
      autosuggest: {
         country: string;
         language: string;
         limit: number;
         types: string;
         region_code: string | undefined;
         max_distance: number;
         jaro_winkler_distance: number;
      };
   };
   settings: {
      max_estimate_id: number;
      scrubbing_ref_board_id: number;
      scrubbing_duplicates_enabled: boolean;
      scrubbing_board_ids: number[];
      scrubbing_force_display_public_yes: boolean;
      defaults: {
         boardId: number[];
         locations_boardId: number;
      };
      locations: {
         drop_coordinates: boolean;
         allow_all_areas: boolean;
         allowed_areas: string[];
         boardId: number;
         active_count_limit: number;
      };
      hide_unavailable_listings_statuses: string[];
      hide_unavailable_listings_http_code: number;
      validationVersion?: string | undefined;
      extended_property_details: boolean;
   };
   xff: {
      ssr_token: string;
      ssg_token: string;
      ssr_ipaddr_offset: number;
   };
   smtp: {
      enabled: boolean;
      app_password: string;
      user: string;
   };
   googlemaps: {
      base_url: string;
      key: string;
      timeout_ms: number;
      country: string;
      language: string;
   };
}
const proximitySearchConfig = {
   lat: process.env["PROXIMITY_SEARCH_LAT"] || "45.420779",
   long: process.env["PROXIMITY_SEARCH_LONG"] || "-75.69791",
   radius_m: parseInt(process.env["PROXIMITY_SEARCH_RADIUS_METERS"] || "150000")
};
const config: AppConfig = {
   nats: {
      enabled: process.env["NATS_ENABLED"] === "true",
      options: {
         servers: [process.env["NATS_SERVER"] || "localhost:4222"],
         name: process.env["NATS_NAME"] || "dev-portal" // will be suffixed with script name :backend or :worker
      },
      creds: process.env["NATS_CREDS"] || '',
      worker: {
         consumer_stream: process.env["NATS_WORKER_CONSUMER_STREAM"] || "boss-people",
         consumer_name: process.env["NATS_WORKER_CONSUMER_NAME"] || "boss-people-worker"
      }
   },
   env: process.env["NODE_ENV"] || "production",
   db: {
      client: "pg",
      connection: {
         host: process.env["DB_HOST"] || "localhost",
         port: parseInt(process.env["DB_PORT"] || "5432"),
         user: process.env["DB_USER"] || "postgres",
         password: process.env["DB_PASSWORD"] || "postgrespw",
         database: process.env["DB_NAME"] || "repliers",
         ssl: process.env["DB_USE_SSL"] === "true" ? {
            rejectUnauthorized: false
         } : false
      },
      migrations: {
         schemaName: "public",
         directory: "./migrations" // we're stick to static path for migrations
      },
      pool: {
         min: 1,
         max: 5
      }
   },
   auth: {
      agents_signature_salt: process.env["AUTH_AGENTS_SIGNATURE_SALT"] || "repliers123",
      otp: {
         ttl_ms: parseInt(process.env["AUTH_OTP_TTL_MS"] || "600000"),
         // 10 min
         resend_ttl_ms: parseInt(process.env['AUTH_OTP_RESEND_TTL_MS'] || '60000'),
         // 1 min
         uri: process.env["AUTH_OTP_URI"] || "http://localhost:3000/auth/otp/processing",
         message: process.env["AUTH_OTP_MESSAGE"] || "Please click on the link below to login",
         message_type: parseOtpMessageType(process.env["AUTH_OTP_MESSAGE_TYPE"]),
         debug_expose_code: process.env["DEBUG_AUTH_OTP_EXPOSE_CODE"] === "true"
      },
      emailtoken: {
         enabled: process.env["AUTH_EMAILTOKEN_ENABLED"] === "true",
         expire: (process.env["AUTH_EMAILTOKEN_EXPIRE"] || "30d") as StringValue,
         auto_otp: process.env["AUTH_EMAILTOKEN_AUTO_OTP"] === "true"
      },
      jwt: {
         privateKey: process.env["JWT_PRIVATE_KEY"] || "",
         publicKey: process.env["JWT_PUBLIC_KEY"] || "",
         issuer: process.env["JWT_ISSUER"] || "http://repliers-proxy",
         expire: (process.env["JWT_EXPIRE"] || "30d") as StringValue
      },
      oauth: {
         google: {
            client_id: process.env["OAUTH_GOOGLE_CLIENT_ID"] || "",
            client_secret: process.env["OAUTH_GOOGLE_CLIENT_SECRET"] || "",
            redirect_uri: process.env["OAUTH_GOOGLE_REDIRECT_URI"] || "",
            scopes: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
         },
         facebook: {
            client_id: process.env["OAUTH_FACEBOOK_CLIENT_ID"] || "",
            client_secret: process.env["OAUTH_FACEBOOK_CLIENT_SECRET"] || "",
            redirect_uri: process.env["OAUTH_FACEBOOK_REDIRECT_URI"] || "",
            scopes: "openid"
         }
      },
      social: {
         pinterest: {
            client_id: process.env["SOCIAL_PINTEREST_CLIENT_ID"] || "1",
            client_secret: process.env["SOCIAL_PINTEREST_CLIENT_SECRET"] || "1",
            redirect_uri: process.env["SOCIAL_PINTEREST_REDIRECT_URI"] || "",
            scopes: "boards:read,pins:read"
         }
      },
      roleOverrides: {
         [UserRole.Agent]: {
            jwt: {
               expire: (process.env["AGENT_JWT_EXPIRE"] || "1d") as StringValue
            }
         }
      }
   },
   app: {
      settings: process.env['APP_SETTINGS_PRESET'],
      disable_persistence: process.env["APP_DISABLE_PERSISTENCE"] === "true",
      env: process.env["APP_ENVIRONMENT"] || "localhost",
      useSwagger: process.env["APP_USESWAGGER"] === "true" || false,
      loglevel: process.env["LOGLEVEL"] || "info",
      port: process.env["PORT"] || 8080,
      stats_top_n: parseInt(process.env["APP_STATSTOP_LIMIT"] || "100"),
      // Need to move this to settings
      cors: {
         validDomains: ["https://portal.repliers.com/", ...(process.env["APP_CORS_DOMAIN"] || "http://localhost:3000").split(',')]
      }
   },
   logtail: {
      token: process.env["LOGTAIL_TOKEN"] || ""
   },
   cache: {
      statswidget: {
         ttl_ms: parseInt(process.env["CACHE_STATSWIDGET_TTL"] || "86400000") // 24 * 60 * 60 * 1000 = 24 hours
      },
      neighborhoodsranking: {
         ttl_ms: parseInt(process.env["CACHE_NEIGHBORHOODSRANKING_TTL"] || "86400000") // 24 * 60 * 60 * 1000 = 24 hours
      },
      autosuggest_locations: {
         ttl_ms: parseInt(process.env["CACHE_AUTOSUGGEST_LOCATIONS_TTL"] || "86400000") // 24 * 60 * 60 * 1000 = 24 hours
      },
      listingscount: {
         ttl_ms: parseInt(process.env["CACHE_LISTINGS_COUNT_TTL"] || "86400000") // 24 * 60 * 60 * 1000 = 24 hours
      }
   },
   repliers: {
      api_key: process.env["REPLIERS_API_KEY"] || "",
      api_key_extra: process.env["REPLIERS_API_KEY_EXTRA"] || "",
      historical_data_key: process.env["REPLIERS_API_KEY_EXTRA"] || "",
      base_url: process.env["REPLIERS_BASE_URL"] || "https://api.repliers.io",
      timeout_ms: parseInt(process.env["REPLIERS_TIMEOUT"] || "30000"),
      proxy_xff: process.env["REPLIERS_PROXY_XFF"] === "true",
      clients: {
         defaultAgentId: parseInt(process.env["REPLIERS_AGENT_ID"] || "0"),
         unauthenticatedClientId: parseInt(process.env["REPLIERS_UNAUTHENTICATED_CLIENT_ID"] || "0"),
         defaultAgentEmail: process.env["REPLIERS_AGENT_EMAIL"]
      },
      autosuggest: {
         max_results: parseInt(process.env["REPLIERS_AUTOSUGGEST_MAX_RESULTS"] || "10"),
         max_results_default: parseInt(process.env["REPLIERS_AUTOSUGGEST_MAX_RESULTS_DEFAULT"] || "3"),
         lat: proximitySearchConfig.lat,
         long: proximitySearchConfig.long,
         radius: proximitySearchConfig.radius_m,
         provider: process.env["REPLIERS_AUTOSUGGEST_PROVIDER"] === "googlemaps" ? "googlemaps" : "mapbox"
      },
      limit: parseInt(process.env['REPLIERS_API_LIMIT'] || '1'),
      interval: parseInt(process.env['REPLIERS_API_INTERVAL_MS'] || '1000'),
      estimatesNotificationSettings: {
         sendEmailNow: typeof process.env['REPLIERS_ESTIMATES_SEND_EMAIL_NOW'] !== 'undefined' ? process.env['REPLIERS_ESTIMATES_SEND_EMAIL_NOW'].toLocaleLowerCase() === 'true' : undefined,
         sendEmailMonthly: typeof process.env['REPLIERS_ESTIMATES_SEND_EMAIL_MONTHLY'] !== 'undefined' ? process.env['REPLIERS_ESTIMATES_SEND_EMAIL_MONTHLY'].toLocaleLowerCase() === 'true' : undefined
      }
   },
   mapbox: {
      access_token: process.env["MAPBOX_ACCESS_TOKEN"] || "",
      base_url: process.env["MAPBOX_BASEURL"] || "https://api.mapbox.com/search/searchbox/v1",
      timeout_ms: parseInt(process.env["MAPBOX_TIMEOUT"] || "30000"),
      autosuggest: {
         country: process.env["PROXIMITY_SEARCH_COUNTRY"] || "ca",
         language: process.env["PROXIMITY_SEARCH_LANGUAGE"] || "en",
         limit: parseInt(process.env["REPLIERS_AUTOSUGGEST_MAX_RESULTS"] || "10"),
         types: "street,postcode,address",
         max_distance: proximitySearchConfig.radius_m,
         region_code: process.env["PROXIMITY_SEARCH_REGION_CODE"],
         jaro_winkler_distance: 0.9
      }
   },
   googlemaps: {
      base_url: process.env["GOOGLE_MAPS_BASE_URL"] || "https://maps.googleapis.com/maps/api",
      key: process.env["GOOGLE_MAPS_API_KEY"] || "",
      timeout_ms: parseInt(process.env["GOOGLE_MAPS_TIMEOUT_MS"] || "30000"),
      country: process.env["PROXIMITY_SEARCH_COUNTRY"] || "ca",
      language: process.env["PROXIMITY_SEARCH_LANGUAGE"] || "en"
   },
   boss: {
      enabled: process.env["BOSS_ENABLED"] !== "false",
      // any value including empty will enable it ?
      base_url: process.env["BOSS_BASEURL"] || "https://api.followupboss.com/v1",
      timeout_ms: parseInt(process.env["BOSS_TIMEOUT_MS"] || "30000"),
      username: process.env["BOSS_USERNAME"] || "",
      password: process.env["BOSS_PASSWORD"] || "",
      system: process.env["BOSS_SYSTEM"] || "",
      system_key: process.env["BOSS_SYSTEM_KEY"] || "",
      webhook: {
         enabled: process.env["BOSS_WEBHOOK_ENABLED"] === "true",
         base_url: process.env["BOSS_WEBHOOK_BASEURL"] || "https://localhost:3000/webhook",
         use_ngrok: process.env["BOSS_WEBHOOK_USE_NGROK"] === "true",
         client_tags: process.env["BOSS_WEBHOOK_CLIENT_TAGS_CSV"] || ""
      },
      custom_AVM_field: process.env["BOSS_CUSTOM_AVM_FIELD"] as CustomBossField | undefined
   },
   ngrok: {
      authtoken: process.env["NGROK_AUTHTOKEN"] || ""
   },
   eventsCollection: {
      defaultEventFields: {
         source: process.env["BOSS_DEFAULT_SOURCE"] || "example.tld"
      },
      defaultPersonFields: {
         assignedTo: process.env["BOSS_DEFAULT_ASSIGNED_TO"] || "Default Agent",
         tags: process.env["BOSS_DEFAULT_TAGS"]?.split(",") || [process.env["APP_ENVIRONMENT"] || "dev"]
      },
      defaultBoardId: process.env["SETTINGS_EVENTS_COLLECTOR_DEFAULT_BOARD_ID"] || "12",
      urlHost: process.env["SETTINGS_EVENTS_COLLECTOR_URL_HOST"] || undefined,
      propertyUrl: process.env["BOSS_PROPERTY_URL"] || "https://example.tld/listing/[MLS_NUMBER]?boardId=[BOARD_ID]",
      clientUrl: process.env["BOSS_CLIENT_URL"] || "https://example.tld/agent/client/[CLIENT_ID]",
      estimateUrl: process.env["BOSS_ESTIMATE_URL"] || "https://example.tld/estimate/[ESTIMATE_ID]",
      savedSearchUrl: process.env["BOSS_SAVED_SEARCH_URL"] || "",
      customFieldsStrategy: process.env["BOSS_CUSTOM_FIELDS_STRATEGY"],
      reportClientViewEstimate: process.env["BOSS_REPORT_CLIENT_VIEW_ESTIMATE"] === "true"
   },
   settings: {
      max_estimate_id: parseInt(process.env["SETTINGS_MAX_ESTIMATE_ID"] || "100000"),
      scrubbing_ref_board_id: parseInt(process.env["DUPLICATES_REFERENCE_BOARD_RESOURCE_ID"] || "9997"),
      scrubbing_board_ids: (process.env["SETTINGS_SCRUBBING_BOARDIDS"] || "12").split(",").map(v => parseInt(v)),
      scrubbing_duplicates_enabled: process.env["SETTINGS_SCRUBBING_PROCESS_DUPLICATES_ENABLED"] !== "false",
      scrubbing_force_display_public_yes: process.env["SETTINGS_SCRUBBING_FORCE_DISPLAY_PUBLIC_YES"] === "true",
      defaults: {
         boardId: (process.env["APP_DEFAULTS_BOARDIDS"] || "110").split(",").map(v => parseInt(v)),
         locations_boardId: parseInt(process.env["APP_LOCATIONS_BOARDID"] || "110")
      },
      locations: {
         drop_coordinates: process.env["SETTINGS_LOCATIONS_DROP_COORDINATES"] === 'true',
         allow_all_areas: process.env["SETTINGS_LOCATIONS_ALLOW_ALL_AREAS"] === 'true',
         allowed_areas: (process.env["SETTINGS_LOCATIONS_ALLOWED_AREAS"] || "").split(',').map(v => v.toLowerCase()),
         boardId: parseInt(process.env["APP_LOCATIONS_BOARDID"] || "110"),
         active_count_limit: parseInt(process.env["SETTINGS_LOCATIONS_ACTIVE_COUNT_LIMIT"] || "5")
      },
      hide_unavailable_listings_statuses: process.env["APP_HIDE_UNAVAILABLE_LISTINGS_STATUSES"] ? process.env["APP_HIDE_UNAVAILABLE_LISTINGS_STATUSES"].split(",") : ['Ter'],
      hide_unavailable_listings_http_code: process.env["APP_HIDE_UNAVAILABLE_LISTINGS_HTTP_CODE"] ? parseInt(process.env["APP_HIDE_UNAVAILABLE_LISTINGS_HTTP_CODE"]) : 410,
      validationVersion: process.env["SETTINGS_VALIDATION_VERSION"],
      extended_property_details: process.env["SETTINGS_EXTENDED_PROPERTY_DETAILS"] === 'true'
   },
   xff: {
      ssr_token: process.env["XFF_SSR_TOKEN"] || "",
      ssg_token: process.env["XFF_SSG_TOKEN"] || "",
      ssr_ipaddr_offset: parseInt(process.env["XFF_SSR_IPADDR_OFFSET"] || "2")
   },
   smtp: {
      enabled: process.env["SMTP_ENABLED"] === "true",
      app_password: process.env["GMAIL_APP_PASSWORD"] || "",
      user: process.env["GMAIL_USER"] || ""
   }
};

// Config validation, would it be cool to have JOI schema for this?
assert(config.mapbox.access_token, "No MAPBOX_ACCESS_TOKEN env variable");
assert(config.repliers.api_key, "No REPLIERS_API_KEY env variable");
assert(config.auth.jwt.privateKey, "No JWT_PRIVATE_KEY env variable");
assert(config.auth.jwt.publicKey, "No JWT_PUBLIC_KEY env variable");
if (config.boss.webhook.enabled) {
   assert(config.boss.system !== '', "Please, specify some unique BOSS_SYSTEM to avoid issues with outher developers");
   if (config.boss.webhook.use_ngrok) {
      assert(config.ngrok.authtoken, "No NGROK_AUTHTOKEN env variable");
   }
}
if (process.env["APP_ENVIRONMENT"] !== "localhost") {
   assert(process.env["GOOGLE_CREDENTIALS"], "No GOOGLE_CREDENTIALS env variable");
}
if (process.env["DEBUG_AUTH_OTP_EXPOSE_CODE"] === "true" && process.env["APP_ENVIRONMENT"]?.includes("prod")) {
   assert(false, "Debugging OTP exposed in production environment");
}

// export default config;
const settings = new Settings(config.app.settings);
export default settings.merge(config);
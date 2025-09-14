# Repliers Portal Backend

This repository contains the backend API for the [Repliers Portal application](https://github.com/Repliers-io/portal-frontend). Follow the setup instructions below to get started with local development.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (min v20.19)
- Git

You'll also need to obtain API keys for the following services:
- **Repliers API**: Create a free account at [https://login.repliers.com/](https://login.repliers.com/) to get your API key for real estate data access
- **Mapbox API**: Create a free account at [https://www.mapbox.com/](https://www.mapbox.com/) to get your API key for location and mapping features

### Installation

1. **Clone the repository**

```bash
git clone git@github.com:Repliers-io/portal-backend.git
cd portal-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Generate JWT keys**

Generate the required JWT private and public keys:

```bash
npm run jwt:generate
```

4. **Configure environment variables**

Create a `.env` file based on the provided `env.example` template:

```bash
cp env.example .env
```

Edit the `.env` file with your specific configuration values. Make sure to add your API keys:

- **REPLIERS_API_KEY**: Your Repliers API key obtained from [https://login.repliers.com/](https://login.repliers.com/)
- **MAPBOX_ACCESS_TOKEN**: Your Mapbox API key obtained from [https://www.mapbox.com/](https://www.mapbox.com/)

5. **Start the development server**

```bash
npm run dev
```

Your server should now be running on the default port (8080).


## Database Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- Docker


### Enable Database Functionality

To enable features that require database access, set `app.disable_persistence = false` in `src/settings/defaults.ts` or any other settings file you use.

### Configure Database Settings

Add the following database configuration to your `.env` file:

```ini
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgrespw
DB_NAME=repliers_portal
DB_PORT=5432
```

### Start PostgreSQL Instance

You can run the `./scripts/run_pg.sh` script to start a Docker Postgres instance using the environment variables from your `.env` file. This will create a Postgres database with the same settings that were added in the previous step.

Alternatively, you can run the following command directly in your terminal (make sure to adjust the parameters as needed):

```bash
docker run --name=repliers_portal --env=POSTGRES_PASSWORD=postgrespw -e POSTGRES_DB=repliers -p 5432:5432 -d postgres:16-alpine
```

### Run Database Migrations

Execute the initial database migration to create the database structure:

```bash
npm run db:migrate
```

### Start the Application

Start the project with database functionality enabled:

```bash
npm run dev
```

### Application Configuration

The file `src/settings/defaults.ts` contains the default application settings that allow you to run the application with sample data available through your free Repliers API key.

When you obtain a paid Repliers API key with access to one or multiple real estate boards (based on your subscription), you will need to update the settings in `src/settings/defaults.ts`. The complete list of available settings can be found in `src/config.ts`.

The application settings are designed so that any configuration you set in `src/settings/defaults.ts` cannot be overridden using environment variables. This ensures consistent application settings across different environments (development, staging, production).

Settings that may vary between environments or should not be committed to the repository (such as API keys, database connection settings, and security keys) are designed to be configured using environment variables.

The complete list of environment variables is provided below.


## Environment Variables

| Variable name                                 | Default value                  | Comment                                                                        |
|           ------------------------            |          :-----------:         |---------------------------------                                               |
| APP_USESWAGGER                                | false                          | Enable /swagger UI for the application                                         |
| APP_DISABLE_PERSISTENCE                       | false                          | Disable persistence (for user roles)                                           |
| NODE_ENV                                      | production                     | Environment mode (use 'development' for npm run dev)                           |
| LOGLEVEL                                      | info                           | Application log level                                                          |
| PORT                                          | 8080                           | Local port to start HTTP server                                                |
| APP_CORS_DOMAIN                               | <http://localhost:3000>                 | List of allowed domains for CORS |
| JWT_PRIVATE_KEY                               |                                | Relative path to private JWT key                                               |
| JWT_PUBLIC_KEY                                |                                | Relative path to public JWT key                                                |
| JWT_ISSUER                                    | <http://repliers-proxy>        | JWT issuer claim (iss)                                                         |
| JWT_EXPIRE                                    | 30d                            | JWT expiration time claim (exp)                                                |
| OAUTH_GOOGLE_CLIENT_ID                        |                                | OAuth client_id for Google                                                     |
| OAUTH_GOOGLE_CLIENT_SECRET                    |                                | OAuth client_secret for Google                                                 |
| OAUTH_GOOGLE_REDIRECT_URI                     |                                | OAuth redirect_uri for Google                                                  |
| OAUTH_FACEBOOK_CLIENT_ID                      |                                | OAuth client_id for Facebook                                                   |
| OAUTH_FACEBOOK_CLIENT_SECRET                  |                                | OAuth client_secret for Facebook                                               |
| OAUTH_FACEBOOK_REDIRECT_URI                   |                                | OAuth redirect_uri for Facebook                                                |
| REPLIERS_BASE_URL                             | <https://api.repliers.io>  |  Base URL of the Repliers API                                           |
| REPLIERS_API_KEY                              | API-KEY                        | Required to access Repliers API. Sample data key can be obtained for free after registering at https://login.repliers.com/ |
| REPLIERS_API_KEY_EXTRA                        |                                | Extra Repliers API key, used if main key has insufficient permissions          |
| REPLIERS_TIMEOUT                              | 30000                          | Timeout for API response in milliseconds                                       |
| REPLIERS_AUTOSUGGEST_MAX_RESULTS              | 10                             | Limit for maximum amount per page                                              |
| REPLIERS_AUTOSUGGEST_MAX_RESULTS_DEFAULT      | 3                              | Default results per page                                                       |
| REPLIERS_AGENT_ID                             | 0 (invalid)                    | agentId to use in Repliers calls                                               |
| REPLIERS_AGENT_EMAIL                          |                                | Agent email to use with custom SMTP                                            |
| REPLIERS_API_LIMIT                            | 1                             | Throttle Repliers API requests to limit                                        |
| REPLIERS_API_INTERVAL_MS                      | 1000                           | Throttle Repliers API requests per interval (milliseconds)                     |
| REPLIERS_PROXY_XFF                            | false                          | Proxy X-Forwarded-For header to Repliers                                       |
| REPLIERS_ESTIMATES_SEND_EMAIL_NOW             | false                          | If true, estimates will be sent to the user via email immediately              |
| REPLIERS_ESTIMATES_SEND_EMAIL_MONTHLY         | false                          | If true, estimates will be sent to the user via email monthly                  |
| MAPBOX_ACCESS_TOKEN                           |                                | Mapbox API token                                                               |
| MAPBOX_BASEURL                                | https://api.mapbox.com/search/searchbox/v1 | Mapbox API URL                                                     |
| MAPBOX_TIMEOUT                                | 30000                          | Mapbox API timeout in milliseconds                                             |
| DEBUG                                         |                                | Used for node-debug                                                            |
| APP_STATSTOP_LIMIT                            | 3                              | Top N limit for stats/neighborhoods ranking                                    |
| AUTH_EMAILTOKEN_ENABLED                       | false                          | Enable login with email token                                                  |
| AUTH_EMAILTOKEN_EXPIRE                       | 30d                             | Expiration time of email token since email sent date                           |
| AUTH_EMAILTOKEN_AUTO_OTP                     | false                           | Controls if OTP will be automatically sent when expired email token is provided |
| AUTH_OTP_TTL_MS                               | 600000                         | Timeout for OTP password in milliseconds                                       |
| AUTH_OTP_RESEND_TTL_MS                        | 60000                          | Timeout for OTP resend in milliseconds                                         |
| AUTH_OTP_MESSAGE                              | Please click on the link below to login | Message sent with OTP link/code                                      |
| AUTH_OTP_MESSAGE_TYPE                         | link_and_code                  | See otpMessageTypes for possible values                                        |
| DEBUG_AUTH_OTP_EXPOSE_CODE                    | false                          | Security will be compromised as OTP code will be exposed in signup/login response. ONLY for DEBUG purposes |
| CACHE_STATSWIDGET_TTL                         | 86400000                       | TTL for stats widget cache in milliseconds                                     |
| CACHE_NEIGHBORHOODSRANKING_TTL                | 86400000                       | TTL for neighborhoods ranking in milliseconds                                  |
| CACHE_LISTINGS_COUNT_TTL                      | 86400000                       | TTL for listings count in milliseconds                                         |
| PROXIMITY_SEARCH_LAT                          | 45.420779                      | Default latitude for proximity search                                          |
| PROXIMITY_SEARCH_LONG                         | -75.69791                      | Default longitude for proximity search                                         |
| PROXIMITY_SEARCH_RADIUS_METERS                | 150000                         | Default radius for proximity search in meters                                  |
| LOGTAIL_TOKEN                                 |                                | Logtail token for logging service                                              |
| GOOGLE_CREDENTIALS                            |                                | Content of GCP service account JSON                                            |
| GOOGLE_APPLICATION_CREDENTIALS                | /app/gcp_key.json              | Path to GCP credentials file (should not be changed)                           |
| BOSS_BASEURL                                  | https://api.followupboss.com/v1| Follow Up Boss API base URL                                                    |
| BOSS_TIMEOUT_MS                               | 30000                          | Follow Up Boss API timeout in milliseconds                                     |
| BOSS_USERNAME                                 |                                | Follow Up Boss username (required)                                             |
| BOSS_PASSWORD                                 |                                | Follow Up Boss password (not needed, left for compatibility)                   |
| BOSS_SYSTEM                                   |                                | Boss System ID (required to register at https://apps.followupboss.com/system-registration) |
| BOSS_SYSTEM_KEY                               |                                | Boss System Key (required to register at https://apps.followupboss.com/system-registration) |
| BOSS_DEFAULT_SOURCE                           | example.tld                     | Default source for Follow Up Boss leads                                        |
| BOSS_DEFAULT_ASSIGNED_TO                      | Default Agent                 | Default agent for Follow Up Boss leads                                         |
| BOSS_DEFAULT_TAGS                             | APP_ENVIRONMENT                | Tags to be added to all leads                                                  |
| BOSS_PROPERTY_URL                             |https://example.tld/listing/[MLS_NUMBER]?boardId=[BOARD_ID]| Property details page (PDP) path template                         |
| BOSS_ESTIMATE_URL                             |https://example.tld/estimate/[ESTIMATE_ID]| Estimate details path template                                       |
| BOSS_SAVED_SEARCH_URL                         |                                | Saved search path template                                                     |
| BOSS_CLIENT_URL                               |https://example.tld/agent/client/[CLIENT_ID]      | Client details path template                                       |
| BOSS_CUSTOM_FIELDS_STRATEGY                   |                                | Allows implementing custom logic for setting person fields per environment     |
| BOSS_ENABLED                                  | true                           | Control Follow Up Boss integration                                              |
| BOSS_WEBHOOK_ENABLED                          | false                          | Control Follow Up Boss webhooks                                                |
| BOSS_WEBHOOK_BASEURL                          | https://localhost:3000/webhook | Base URL for Follow Up Boss webhooks                                           |
| BOSS_WEBHOOK_USE_NGROK                        | false                          | Use ngrok for local webhook testing (requires ngrok token)                     |
| BOSS_WEBHOOK_CLIENT_TAGS_CSV                  |                                | Comma-separated client tags                                                     |
| BOSS_CUSTOM_AVM_FIELD                         |                                | Field name to be used to save AVM link in Boss people profile                 |
| BOSS_REPORT_CLIENT_VIEW_ESTIMATE              |                                | If true, reports GET /estimate by UserRole.User                                |
| NGROK_AUTHTOKEN                               | ''                             | Ngrok auth token for local webhook testing                                     |
| APP_DEFAULTS_BOARDIDS                         | 110                          | Comma-separated default boardIds                                               |
| APP_LOCATIONS_BOARDID                         | 110                             | Default boardId to fetch /locations                                           |
| SETTINGS_EVENTS_COLLECTOR_DEFAULT_BOARD_ID    | 110                             | Default boardId to fetch by MLS number when board id is not provided          |
| DUPLICATES_REFERENCE_BOARD_RESOURCE_ID        | 9997                           | Reference board id for duplicates scrubbing                                    |
| SETTINGS_SCRUBBING_BOARDIDS                   | 110                             | Comma-separated boardIds to have listings scrubbed for non-authenticated users |
| SETTINGS_SCRUBBING_PROCESS_DUPLICATES_ENABLED | true                           | Control scrubbing duplicates                                                   |
| APP_HIDE_UNAVAILABLE_LISTINGS_STATUSES        | Ter                            | List of CSV statuses which should not be available for frontend                |
| APP_HIDE_UNAVAILABLE_LISTINGS_HTTP_CODE       | 410                            | HTTP status code frontend receives when unavailable listing is requested       |
| DB_HOST                                       | localhost                      | Database host                                                                  |
| DB_USER                                       | postgres                       | Database user                                                                  |
| DB_PASSWORD                                   | postgrespw                     | Database password                                                              |
| DB_NAME                                       | repliers                       | Database name                                                                  |
| DB_USE_SSL                                    | false                          | Controls PostgreSQL SSL (false on localhost, must be true on Heroku)          |
| SETTINGS_SCRUBBING_FORCE_DISPLAY_PUBLIC_YES   | false                          | Set to true to have permissions.displayPublic == 'Y' for all listings         |
| SETTINGS_LOCATIONS_DROP_COORDINATES           | false                          | Set to true to drop coordinates from locations                                 |
| SETTINGS_LOCATIONS_ALLOW_ALL_AREAS            | false                          | Set to true to allow all areas from /locations endpoints                       |
| SETTINGS_LOCATIONS_ALLOWED_AREAS              | ''                             | Comma-separated names of areas allowed to be returned from /locations endpoints |
| SOCIAL_PINTEREST_CLIENT_ID                    |                                | Pinterest client_id                                                            |
| SOCIAL_PINTEREST_CLIENT_SECRET                |                                | Pinterest client_secret                                                        |
| SOCIAL_PINTEREST_REDIRECT_URI                 |                                | Pinterest redirect_uri                                                         |
| NATS_SERVER                                   | localhost:4222                 | NATS server URL                                                                |
| NATS_NAME                                     | dev-portal                     | NATS client name (with appended script name - backend, worker) used as connection ID when connecting to NATS server |
| NATS_ENABLED                                  | false                          | If false, NATS functionality will be replaced with dummy implementation        |
| NATS_CREDS                                    | ''                             | NATS credentials file content (leave empty string for local NATS)              |
| NATS_WORKER_CONSUMER_STREAM                   | boss-people                    | NATS stream worker consumer stream name                                        |
| NATS_WORKER_CONSUMER_NAME                     | boss-people-worker             | NATS stream worker consumer name                                               |
| SETTINGS_EXTENDED_PROPERTY_DETAILS            | false                          | If true, GET /estimates/property_details will return approximated property details (average tax and neighborhood) if no historical listings found |
| AUTH_AGENTS_SIGNATURE_SALT                    | repliers123                    | Signature salt for agents authentication                                       |
| SMTP_ENABLED                                  | false                          | Switch to use Gmail instead of Repliers messaging                              |
| GMAIL_APP_PASSWORD                            |                                | Gmail application password                                                     |
| GMAIL_USER                                    |                                | Gmail email to be used as sender                                               |
| GOOGLE_MAPS_BASE_URL                         |                                | Google Maps base URL                                                           |
| GOOGLE_MAPS_API_KEY                          |                                | Google Maps API key                                                             |
| GOOGLE_MAPS_TIMEOUT_MS                       | 30000                          | Google Maps timeout in milliseconds                                             |
| REPLIERS_AUTOSUGGEST_PROVIDER                | mapbox                         | Provider to use for address autosuggest (mapbox or google)                     |

## Development Notes

### Known Workarounds

- **tsx limitation**: We cannot use tsx, which is simpler and faster than ts-node, as it doesn't support the `emitDecoratorsMetadata` option from tsconfig.json

- **ts-node version compatibility**: Stable ts-node 10.9.2 doesn't fully support TypeScript 5+ because it can't handle multiple extends in tsconfig.json, so we use ts-node@11-beta

- **TypeScript 5.3+ configuration**: There's a bug in ts-node@11-beta with TypeScript 5.3+ that requires specifying the full path for extendable config in tsconfig.json. Instead of extending from `@tsconfig/*`, we extend from `./node_modules/@tsconfig/...`

- **ESM loader issue**: ts-node beta doesn't correctly export the ESM loader, so we inject a special loader for the nodemon + ts-node setup for the dev script. See `src/ts-loader.js`

- **Google credentials**: There's a small script in `.profile` to generate the Google credentials JSON file from an environment variable

- **Cached decorator types**: `@cached()` decorated functions actually return only `Cached<T>` but are marked as returning `Promise<T | Cached<T>>` because TypeScript doesn't know about decorated return types

### Long-term Concerns

- **Dependency injection**: tsyringe appears to be abandoned by Microsoft, so we need to find a good replacement for the IoC Container

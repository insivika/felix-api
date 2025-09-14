import type { AppConfig } from "../config.js";
import presets from "../settings/index.js";
import _ from 'lodash';
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
function constructUrl(host: string, path: string): string {
   const normalizedHost = host.replace(/\/+$/, '');
   const normalizedPath = path.replace(/^\/+/, '');
   return `${normalizedHost}/${normalizedPath}`;
}
function constructEventsCollectionUrls(config: AppConfig): AppConfig {
   const {
      urlHost,
      propertyUrl,
      clientUrl,
      estimateUrl,
      savedSearchUrl
   } = config.eventsCollection;
   if (urlHost) {
      config.eventsCollection.propertyUrl = constructUrl(urlHost, propertyUrl);
      config.eventsCollection.clientUrl = constructUrl(urlHost, clientUrl);
      config.eventsCollection.estimateUrl = constructUrl(urlHost, estimateUrl);
      if (savedSearchUrl) {
         config.eventsCollection.savedSearchUrl = constructUrl(urlHost, savedSearchUrl);
      }
   }
   return config;
}

//TODO: ADD GCP Logging
export default class Settings {
   private settings: DeepPartial<AppConfig> = {};
   constructor(private preset?: string) {
      if (!this.preset) {
         console.warn(`[SETTINGS] No preset specified. Using environment variables only.
                  You can use the APP_SETTINGS_PRESET environment variable to specify a settings preset.`);
         return;
      }
      console.log(`[SETTINGS] Trying preset: ${this.preset}`);
      if (this.preset in presets) {
         const presetValue = presets[this.preset];
         console.log(`[SETTINGS] Preset loaded: ${this.preset}`);
         if (presetValue !== undefined) {
            // Now TypeScript knows presetValue is Partial<AppConfig>
            this.settings = presetValue;
         }
      } else {
         console.warn(`[SETTINGS] Preset not found: ${this.preset}`);
      }
   }
   merge(config: AppConfig): AppConfig {
      const mergedConfig = _.merge(config, this.settings);
      return this.postProcess(mergedConfig);
   }
   private postProcess(config: AppConfig): AppConfig {
      return constructEventsCollectionUrls(config);
   }
}
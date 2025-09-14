import { DeepPartial } from "../lib/settings.js";
import type { AppConfig } from "../config.js";
import defaults from "./defaults.js";
const presets: Record<string, DeepPartial<AppConfig>> = {
   defaults: defaults
};
export default presets;
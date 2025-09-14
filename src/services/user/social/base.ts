import { IncomingMessage } from "http";
import { TokenSet } from "openid-client";
export default interface SocialProviderBase {
   getUrl(): string;
   callback(req: IncomingMessage): Promise<TokenSet>;
   refresh(params: Record<string, unknown>): Promise<TokenSet>;
}
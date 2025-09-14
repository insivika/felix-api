import { JwtPayload } from "jsonwebtoken";
export interface OAuthAdapterExtractedUser extends Record<string, unknown> {
   agentId: number;
}
export default interface OAuthBaseAdapter {
   extractUserInfo(decoded_id_token: JwtPayload, access_token?: string): Promise<OAuthAdapterExtractedUser>;
}
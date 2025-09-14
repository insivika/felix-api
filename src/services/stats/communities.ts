const communities: DataCommunitiesPlain = {};
export default communities;
export const revComunities: DataCommunitiesReverse = {};
for (const [community, districts] of Object.entries(communities)) {
   for (const district of districts) {
      revComunities[district] = community;
   }
}
export interface DataCommunitiesPlain {
   [key: string]: number[];
}
export interface DataCommunitiesReverse {
   [key: number]: string;
}
export interface DataCommunities {
   communities: DataCommunitiesPlain;
   revComunities: DataCommunitiesReverse;
}
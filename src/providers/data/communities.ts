import communities, { revComunities } from "../../services/stats/communities.js";
export default {
   token: "data.communities",
   useValue: {
      communities,
      revComunities
   }
};
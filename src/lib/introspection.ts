import { basename } from "path";
const postfixMap = new Map([["index", "backend"], ["worker", "worker"]]);
export const getProcessName = () => {
   const postfix = basename(process.argv[1] || "").split(".")[0] || "index";
   return postfixMap.has(postfix) ? postfixMap.get(postfix) : "unknown";
};
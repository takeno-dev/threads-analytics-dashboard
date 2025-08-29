import "server-only";

import { cache } from "react";

import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const createContext = cache(async () => {
  return createTRPCContext();
});

export const api = createCaller(createContext);
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { postsRouter } from "@/server/api/routers/posts";
import { profileRouter } from "@/server/api/routers/profile";

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
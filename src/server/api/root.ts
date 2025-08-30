import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { postsRouter } from "@/server/api/routers/posts";
import { profileRouter } from "@/server/api/routers/profile";
import { threadsRouter } from "@/server/api/routers/threads";

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
  threads: threadsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
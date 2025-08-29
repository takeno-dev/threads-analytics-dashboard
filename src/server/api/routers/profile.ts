import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileImageUrl: true,
        email: true,
        threadsUserId: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }),
});
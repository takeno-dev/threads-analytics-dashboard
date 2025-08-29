import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const postsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        insights: true,
        replies: true,
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(500),
      mediaUrls: z.array(z.string().url()).optional(),
      postType: z.enum(["TEXT", "IMAGE", "VIDEO", "POLL", "CAROUSEL"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          content: input.content,
          mediaUrls: input.mediaUrls,
          postType: input.postType || "TEXT",
          userId: ctx.session.user.id,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.post.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          insights: true,
          replies: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
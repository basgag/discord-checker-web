import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  getById: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return user;
    }),
  delete: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) => {
      const userCount = await ctx.prisma.user.count();
      if (userCount === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete the only user",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete yourself",
        });
      }

      // TODO: Implement permissions system

      return ctx.prisma.user.delete({
        where: {
          id,
        },
      });
    }),
});
